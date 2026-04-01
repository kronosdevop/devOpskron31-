<template>
  <!-- eslint-disable -->
  <v-dialog
    :model-value="datacorrectionDialog"
    @update:model-value="$emit('update:datacorrectionDialog', $event)"
    persistent
    transition="dialog-bottom-transition"
    max-width="550"
  >
    <v-card>
      <v-toolbar elevation="0" dark density="compact" class="navBar">
        <v-toolbar-title class="ml-2">
          <div class="custom-title">Add Data Correction</div>
        </v-toolbar-title>
        <v-spacer />
        <v-icon class="mr-3" @click="close_dialog">mdi-close</v-icon>
      </v-toolbar>

      <v-card-text class="mt-4">
        <v-form ref="form">
          <v-row>
            <v-col cols="12">
              <v-autocomplete
                v-model="membername"
                :items="types_item"
                :search-input.sync="search"
                @input="search = ''"
                item-text="title"
                item-value="value"
                density="compact"
                variant="outlined"
                label="Select Member"
                placeholder="Min 3 Characters"
                :rules="[(v) => !!v || 'Required']"
                :menu-props="{ offsetY: true, maxHeight: 200 }"
              ></v-autocomplete>

              <v-autocomplete
                v-model="location_name"
                :items="loction_item"
                :search-input.sync="searchs"
                @input="searchs = ''"
                item-text="title"
                item-value="location_id"
                label="Select Location"
                variant="outlined"
                density="compact"
                :rules="[(v) => !!v || 'Required']"
                :menu-props="{ offsetY: true, maxHeight: 200 }"
              />

              <v-row>
                <v-col cols="6">
                  <v-text-field
                    label="Select Date *"
                    variant="outlined"
                    density="compact"
                    v-model="selectdatacorrection"
                    @click="modal = true"
                    :rules="[(v) => !!v || 'Required ']"
                    readonly
                  >
                    <v-dialog v-model="modal" persistent max-width="325">
                      <v-card>
                        <v-date-picker
                          v-model="data"
                          :max="new Date().toISOString().substr(0, 10)"
                          color="#DB4C77"
                          :min="minmonth"
                          class="primaryColor"
                        ></v-date-picker>
                        <v-card-actions>
                          <v-spacer />
                          <v-btn text color="primaryColor" @click="cancelDate"
                            >Cancel</v-btn
                          >
                          <v-btn text color="primaryColor" @click="saveDateTo"
                            >OK</v-btn
                          >
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                  </v-text-field>
                </v-col>

                <v-col cols="6">
                  <v-text-field
                    v-model="picktime"
                    :rules="[(v) => !!v || 'Required']"
                    density="compact"
                    variant="outlined"
                    class="ml-2"
                    label="Select Time *"
                    readonly
                    @click="timedialog = true"
                  />

                  <v-dialog v-model="timedialog" persistent max-width="290">
                    <v-card>
                      <v-time-picker
                        v-model="tempTime"
                        format="24hr"
                        full-width
                        :max="shouldRestrictTime ? getCurrentTime() : '23:59'"
                        :disabled-minutes="
                          shouldRestrictTime ? getDisabledMinutes : undefined
                        "
                        :disabled-hours="
                          shouldRestrictTime ? getDisabledHours : undefined
                        "
                        color="#DB4C77"
                      ></v-time-picker>
                      <v-card-actions>
                        <v-spacer />
                        <v-btn text color="primaryColor" @click="cancelTime"
                          >Cancel</v-btn
                        >
                        <v-btn text color="primaryColor" @click="saveTime"
                          >OK</v-btn
                        >
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-col>
              </v-row>

              <v-select
                v-model="Datacomments"
                label="Comments *"
                density="compact"
                variant="outlined"
                :items="CommentsItems"
                :rules="[(v) => !!v || 'Required']"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-card-actions class="justify-end">
        <v-btn
          :loading="loading"
          class="text-capitalize cardCss text-white"
          @click="validate_data"
        >
          Save
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import moment from "moment";
import { API, graphqlOperation } from "aws-amplify";
import { data_correction_swipes_from_admins } from "@/graphql/mutations";
import {
  datacorrection_comments_list_edit,
  all_users_of_organization,
} from "@/graphql/queries";
import { get_location_details } from "@/mixins/GetLocations";
import { VTimePicker } from 'vuetify/components'


export default {
  components: {
    VTimePicker,
  },
  mixins: [get_location_details],
  props: {
    datacorrectionDialog: Boolean,
  },
  data() {
    return {
      loading: false,
      location_name: "",
      membername: "",
      Datacomments: "",
      data: new Date().toISOString().substr(0, 10),
      picktime: "",
      tempTime: "",
      modal: false,
      timedialog: false,
      timedisable: false,
      minmonth: "",
      CommentsItems: [],
      types_item: [],
      loction_item: [],
      search: "",
      searchs: "",
    };
  },
  computed: {
    selectdatacorrection() {
      return this.formatDate(this.data);
    },
    shouldRestrictTime() {
      const today = new Date().toISOString().split("T")[0];
      return this.data === today;
    },
  },
  watch: {
    datacorrectionDialog: {
      async handler(val) {
        if (val) {
          this.resetForm();
          this.selectedDate = this.get_orgdate(
            this.$store.getters.GetUserObj.organization.organization_created_on,
          );
          this.minmonth = moment(this.selectedDate, "MM/DD/YYYY").format(
            "YYYY-MM-DD",
          );

          this.$store.commit("Setnamesearch", "");
          await this.get_all_org_users();
          await this.get_location_details();
          this.fetch_users();
          this.get_list();
          this.check_data();
        }
      },
      immediate: true,
    },
    search(val) {
      if (val?.length >= 3) this.get_all_org_users();
    },
  },
  methods: {
    cleartime() {
      this.endTime = "";
    },
    saveDateTo() {
      if (this.data) {
        this.selectdatacorrection = this.formatDate(this.data);
      }
      this.modal = false;
      this.picktime = "";
      this.tempTime = "";
    },
    saveTime() {
      this.picktime = this.tempTime;
      this.timedialog = false;
    },
    cancelDate() {
      this.modal = false;
      this.data = new Date().toISOString().substr(0, 10);
    },
    cancelTime() {
      this.tempTime = this.picktime;
      this.timedialog = false;
    },
    resetForm() {
      this.membername = "";
      this.location_name = "";
      this.Datacomments = "";
      this.picktime = "";
      this.search = "";
      this.searchs = "";
      this.$refs.form?.resetValidation?.();
    },
    async get_all_org_users() {
      const orgId = this.$store.getters.GetUserObj.organization.organization_id;
      try {
        const result = await API.graphql(
          graphqlOperation(all_users_of_organization, {
            input: { organization_id: orgId, name_search: this.search || "" },
          }),
        );
        const users =
          JSON.parse(result.data.all_users_of_organization)?.data || [];
        this.types_item = users
          .filter(
            (u) => u.user_status === "ACTIVE" && u.user_type !== "CHATBOT",
          )
          .map((u) => ({ title: u.full_user_name, value: u.user_id }));
      } catch (err) {
        console.error("User fetch error", err);
      }
    },
    fetch_users() {
      this.loction_item = this.locationList.map((loc) => ({
        title: loc.location_name,
        location_id: loc.location_id,
      }));
    },
    async get_list() {
      const orgId = this.$store.getters.GetUserObj.organization.organization_id;
      try {
        const result = await API.graphql(
          graphqlOperation(datacorrection_comments_list_edit, {
            input: { organization_id: orgId, action_type: "LIST" },
          }),
        );
        this.CommentsItems = JSON.parse(
          result.data.datacorrection_comments_list_edit,
        ).data.datacorrection_comments;
      } catch (err) {
        console.error("Comments fetch error", err);
      }
    },
    async validate_data() {
      const { valid } = await this.$refs.form?.validate?.();
      if (valid) {
        this.datacorrection_save();
      }
    },
    async datacorrection_save() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;

      let dateString =
        typeof this.data === "string"
          ? this.data
          : this.data.toISOString().split("T")[0];

      // Check if dateString is not the current date, then add +1 day
      const today = new Date().toISOString().split("T")[0];
      if (dateString !== today) {
        const currentDate = new Date(dateString);
        currentDate.setDate(currentDate.getDate() + 1);
        dateString = currentDate.toISOString().split("T")[0];
      }

      const timeString = this.picktime || "00:00";

      var new_time = Math.floor(
        new Date(
          dateString.split("-")[0],
          dateString.split("-")[1] - 1,
          dateString.split("-")[2],
          timeString.split(":")[0],
          timeString.split(":")[1],
        ).getTime() / 1000,
      );

      try {
        let result = await API.graphql(
          graphqlOperation(data_correction_swipes_from_admins, {
            input: {
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              location_id: this.location_name,
              user_id: this.membername,
              datacorrection_swiped_time: new_time,
              datacorrected_comments: this.Datacomments,
            },
          }),
        );
        var response = JSON.parse(
          result.data.data_correction_swipes_from_admins,
        );
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("dataCorrection", "dataValue");
          this.check_data();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
    get_orgdate(unix) {
      return new Date(unix * 1000).toLocaleDateString("en-US");
    },
    check_data() {
      const today = new Date().toISOString().split("T")[0];
      const currentDate =
        typeof this.data === "string"
          ? this.data
          : this.data.toISOString().split("T")[0];
      this.timedisable = currentDate === today;

      // Reset time if switching to current date
      if (this.timedisable) {
        this.picktime = "";
        this.tempTime = "";
      }
    },
    getDisabledMinutes() {
      if (!this.shouldRestrictTime) return [];

      const now = new Date();
      const [selectedHour] = (this.tempTime || "").split(":").map(Number);
      const currentHour = now.getHours();

      // If selected hour is less than current hour, no minutes are disabled
      if (selectedHour < currentHour) return [];

      // If selected hour is current hour, disable minutes after current minute
      if (selectedHour === currentHour) {
        return Array.from(
          { length: 60 - now.getMinutes() - 1 },
          (_, i) => now.getMinutes() + 1 + i,
        );
      }

      // If selected hour is greater than current hour, all minutes are disabled
      return Array.from({ length: 60 }, (_, i) => i);
    },
    getDisabledHours() {
      if (!this.shouldRestrictTime) return [];

      const now = new Date();
      const currentHour = now.getHours();

      return Array.from(
        { length: 24 - currentHour - 1 },
        (_, i) => currentHour + 1 + i,
      );
    },
    getCurrentTime() {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes(),
      ).padStart(2, "0")}`;
    },
    formatDate(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${day}/${month}/${year}`;
    },
    close_dialog() {
      this.resetForm();
      this.$emit("clicked", 0);
    },
  },
};
</script>
