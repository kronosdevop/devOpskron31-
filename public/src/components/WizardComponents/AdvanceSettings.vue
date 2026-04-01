<template>
  <div>
    <v-card class="" flat>
      <v-form ref="form">
        <v-row class="mt-3" no-gutters>
          <v-col cols="12" class="d-flex align-center justify-center">
            <b> Choose timezone for your Organization ?</b>
          </v-col>
          <v-col cols="12">
            <v-autocomplete
              class="mt-2"
              label="Time Zone"
              v-model="timeZonesSelected"
              :items="timezonesArray"
              style="max-width: 300px"
              v-model:search="search"
              variant="outlined"
              density="compact"
              :menu-props="{ offset: true, maxHeight: 200 }"
            ></v-autocomplete>
          </v-col>
          <v-col cols="12" class="d-flex align-center justify-center">
            <b> Choose the region where data needs to be hosted </b>
          </v-col>
          <v-col cols="12">
            <v-radio-group
              :rules="[(v) => !!v || 'Required ']"
              v-model="dataSeletion"
              inline  
            >
              <v-radio
                label="Default Repository"
                value="defaultRepository"
              ></v-radio>
              <v-radio
                label="Custom Repository"
                value="customRepository"
              ></v-radio>
            </v-radio-group>
          </v-col>
          <v-col
            v-if="dataSeletion == 'defaultRepository'"
            class="mt-3"
            cols="12"
          >
            <v-select
              density="compact"
              variant="outlined"
              :rules="
                dataSeletion == 'defaultRepository'
                  ? [(v) => !!v || 'Required ']
                  : []
              "
              :items="bucketList"
              v-model="bucketRegion"
              label="Select Region"
              item-title="label"
              item-value="value"
            />
          </v-col>
          <v-col v-if="dataSeletion == 'customRepository'" cols="6">
            <v-textarea
              density="compact"
              auto-grow
              variant="outlined"
              :rules="
                dataSeletion == 'customRepository'
                  ? [(v) => !!v || 'Required ']
                  : []
              "
              v-model="accesKeyID"
              rows="0"
              label="AWS Access Key"
            />
          </v-col>
          <v-col v-if="dataSeletion == 'customRepository'" cols="6">
            <v-textarea
              density="compact"
              auto-grow
              class="ml-2"
              variant="outlined"
              :rules="
                dataSeletion == 'customRepository'
                  ? [(v) => !!v || 'Required ']
                  : []
              "
              v-model="secretKeyId"
              rows="0"
              label="AWS Secret Key"
            />
          </v-col>
          <v-col v-if="dataSeletion == 'customRepository'" cols="6">
            <v-select
              density="compact"
              variant="outlined"
              :rules="
                dataSeletion == 'customRepository'
                  ? [(v) => !!v || 'Required ']
                  : []
              "
              :items="bucketList"
              v-model="awsRegion"
              label="AWS Region"
              item-title="label"
              item-value="value"
            />
          </v-col>
          <v-col cols="12" class="d-flex align-center justify-center">
            <b> Choose your weekly days off</b>
          </v-col>
          <v-col cols="12">
            <v-row no-gutters>
              <v-col
                v-for="(category, index) in types"
                :key="types[index].text"
                cols="12"
                sm="3"
                class=""
              >
                <v-checkbox
                  light
                  :label="category.text"
                  v-model="category.value"
                  @click="get_value(category)"
                  :disabled="shouldDisableOthers && !category.value"
                >
                </v-checkbox>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
      <v-card-actions class="justify-center mt-4">
        <v-btn depressed @click="back_to_3rd_step()" dark color="primary">
          Back
        </v-btn>
        <v-btn depressed @click="next_step()" dark class="cardCss">
          Next
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>
<script>
/*eslint-disable*/
import { get_timezones_details } from "@/mixins/GetTimeZones.js";
import { get_s3_regions } from "@/mixins/GetBucketRegion.js";
var axios = require("axios");

export default {
  mixins: [get_s3_regions, get_timezones_details],
  data() {
    return {
      timeZonesSelected: "",
      timezonesArray: [],
      search: "",
      bucketList: [],
      dataSeletion: "",
      bucketRegion: "",
      accesKeyID: "",
      types: [
        { text: "Sunday", value: true  },
        { text: "Monday", value: false },
        { text: "Tuesday", value: false },
        { text: "Wednesday", value: false },
        { text: "Thursday", value: false },
        { text: "Friday", value: false },
        { text: "Saturday", value: false },
      ],
      selectedWeeks: [],
      awsRegion: "",
    };
  },

  computed: {
    // Count how many checkboxes are currently selected
    selectedCount() {
      return this.types.filter(type => type.value).length;
    },
    
    // Check if we should disable other checkboxes (when 3 are selected)
    shouldDisableOthers() {
      return this.selectedCount >= 3;
    }
  },

  async created() {
    this.selectedWeeks = [];
    this.timezonesArray = [];
    await this.get_timezones_details();
    await this.get_s3_regions();

    this.fetch_regions();
  },

  mounted() {
    const apiKey = "7dc7ae8d1cc54ab2ae3753110b2a7726";

    this.getTimezoneAndCountry(apiKey);
  },
  methods: {
 async   next_step() {
  const {valid} = await this.$refs.form.validate();
      if (valid) {
        var data = {
          timeZoneArray: this.timeZonesSelected,
          defaultSelected:
            this.dataSeletion == "defaultRepository" ? true : false,
          regionbucket:
            this.dataSeletion == "defaultRepository"
              ? this.bucketRegion
              : undefined,
          accesKeyID:
            this.dataSeletion == "customRepository"
              ? this.accesKeyID
              : undefined,
          secretAccesID:
            this.dataSeletion == "customRepository"
              ? this.secretKeyId
              : undefined,
          customawsRegion:
            this.dataSeletion == "customRepository"
              ? this.awsRegion
              : undefined,
          weekOffs: this.get_week_of(),
        };
        this.$emit("fifthstep", data);
      }
    },

    back_to_3rd_step() {
      this.$emit("prevthirdstep", 3);
    },

    getTimezoneAndCountry(apiKey) {
      const url = `https://api.geoapify.com/v1/ipinfo?apiKey=${apiKey}`;

      axios
        .get(url)
        .then((response) => {
          const data = response.data;

          if (data) {
            this.getTimezone(
              apiKey,
              data.location.latitude,
              data.location.longitude
            );
          } else {
            // console.error("No location data found.");
          }
        })
        .catch((error) => {
          // console.error("Error fetching geolocation data:", error);
        });
    },

    get_week_of() {
      for (var i = 0; i < this.types.length; i++) {
        for (var j = 0; j < this.selectedWeeks.length; j++) {
          if (this.types[i].text == this.selectedWeeks[j].text) {
            this.types[i].value = this.selectedWeeks[j].value;
          }
        }
      }
      var mapped = this.types.map((item) => ({
        [item.text]: item.value == true,
      }));
      var newObj = Object.assign({}, ...mapped);
      return JSON.stringify(newObj);
    },

    get_value(val) {
      // If this checkbox is being unchecked, allow it
      if (!val.value) {
        // Remove from selectedWeeks if it exists
        this.selectedWeeks = this.selectedWeeks.filter(item => item.text !== val.text);
        return;
      }
      
      // If we're already at 3 selected and trying to check another one, prevent it
      if (this.selectedCount >= 3 && !val.value) {
        return;
      }
      
      // Add to selectedWeeks if not already present
      const existingIndex = this.selectedWeeks.findIndex(item => item.text === val.text);
      if (existingIndex === -1) {
        this.selectedWeeks.push(val);
      }
    },

    getTimezone(apiKey, latitude, longitude) {
      const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&format=json&apiKey=${apiKey}`;

      axios
        .get(url)
        .then((response) => {
          const data = response.data;

          if (data) {
            this.timeZonesSelected = data.results[0].timezone.name;
          } else {
          }
        })
        .catch((error) => {});
    },

    fetch_regions() {
  this.bucketList = [];
  this.timezonesArray = this.timeZonesList;
  this.listRegions.forEach((element) => {
    this.bucketList.push({
      label: element.region_name,
      value: element.region,
    });
  });
  if (this.bucketList.length > 0) {
    this.bucketRegion = this.bucketList[0].value;
  }
},
  },
};
</script>
