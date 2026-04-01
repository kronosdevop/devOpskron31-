<template>
  <div>
    <v-toolbar class="mt-4"  flat dense>
      <v-select
        dense
        outlined
        style="max-width: 250px"
        class="mt-8"
        :items="['All', 'Active', 'Deactive']"
        v-model="selectedStatus"
        label="Filter by Status"
      ></v-select>
      <v-spacer />
      <v-btn dark @click="create_guest_house()" class="text-capitalize cardCss">
        Create
      </v-btn>
    </v-toolbar>
    <v-card class=""  flat>
      <OverlayComp :overlay="overlay" />

      <v-card-text>
        <v-row>
          <v-col
            v-for="(beach, index) in filteredBeaches"
            :key="index"
            cols="12"
            sm="4"
          >
            <v-card>
              <v-carousel
                hide-delimiter-background
                delimiter-icon="mdi-minus"
                height="250"
                v-if="beach.image && beach.image.length > 0"
                continuous="false"
                :cycle="cycle"
                :show-arrows="false"
              >
                <v-carousel-item
                  v-for="(img, imgIndex) in beach.image"
                  :key="imgIndex"
                  :src="img"
                  @click="fetch_calender(beach)"
                >
                </v-carousel-item>
              </v-carousel>

              <v-card-text class="text--primary">
                <div class="d-flex justify-space-between align-center">
                  <span>{{ beach.name }}</span>
                  <v-spacer />
                  <v-icon size="50" class="mr-n4 d-flex align-center" :color="
                      beach.guest_house_status === 'ACTIVE' ? 'green' : 'red'
                    " @click="
                      beach.guest_house_status === 'ACTIVE'
                        ? delete_guesthouse(beach)
                        : null
                    "
                    >mdi-circle-small</v-icon>
                  <!-- <v-badge
                    :color="
                      beach.guest_house_status === 'ACTIVE' ? 'green' : 'red'
                    "
                    class="mt-2 mr-2"
                    dot
                    @click="
                      beach.guest_house_status === 'ACTIVE'
                        ? delete_guesthouse(beach)
                        : null
                    "
                  >
                    {{ beach.guest_house_status === "ACTIVE" ? "" : "" }}
                  </v-badge> -->
                  <v-icon
                    small
                    color="primaryColor"
                    class="ml-2"
                    @click="edit_guesthouse(beach)"
                    >mdi-pencil</v-icon
                  >
                </div>
                <div>{{ beach.location }}</div>
                <div>₹{{ beach.cost }}</div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <div class="center-container" v-if="beaches == ''">
          <span v-if="beaches == ''">No Guest House Found!</span>
        </div>
      </v-card-text>
    </v-card>
    <div v-if="componenetCheck == 1">
      <GuestHouseCreation
        :creationDialogue="creationDialogue"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="creationDialogue = false"
      />
    </div>
    <div v-if="componenetCheck == 2">
      <DeleteGuestHouse
        :deleteguestDialog="deleteguestDialog"
        :ViewInfo="ViewInfo"
        @clicked="deleteguestDialog = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <div v-if="componenetCheck == 3">
      <EditGuestHouse
        :editDialogue="editDialogue"
        :ViewInfo="ViewInfo"
        @clicked="editDialogue = false"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
      />
    </div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
/*eslint-disable*/
import GuestHouseCreation from "@/components/GuestHouseBooking/AllPopups/GuestHouseCreation.vue";
import DeleteGuestHouse from "@/components/GuestHouseBooking/DeleteGuestHouse.vue";
import EditGuestHouse from "@/components/GuestHouseBooking/EditGuestHouse.vue";
import BookingCalender from "@/components/GuestHouseBooking/BookingCalender.vue";
import { lit_org_guest_houses } from "@/graphql/queries.js";
import { API, graphqlOperation } from "aws-amplify";
import OverlayComp from "@/components/OverlayComp.vue";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    GuestHouseCreation,
    OverlayComp,
    DeleteGuestHouse,
    EditGuestHouse,
    BookingCalender,
    SnackBar,
  },
  data() {
    return {
      selectedStatus: "All",
      nextToken: null,
      beaches: [],
      SnackBarComponent: {},
      componenetCheck: 0,
      creationDialogue: false,
      overlay: false,
      ViewInfo: {},
      deleteguestDialog: false,
      editDialogue: false,
      cycle: false,
    };
  },

  computed: {
    filteredBeaches() {
      if (this.selectedStatus === "All") {
        return this.beaches;
      }
      return this.beaches.filter((beach) =>
        this.selectedStatus === "Active"
          ? beach.guest_house_status === "ACTIVE"
          : beach.guest_house_status !== "ACTIVE"
      );
    },
  },

  mounted() {
    this.fetch_guest_list();
  },
  methods: {
    delete_guesthouse(item) {
      // console.log("item", item);
      this.componenetCheck = 2;
      this.deleteguestDialog = true;
      this.ViewInfo = item;
    },
    edit_guesthouse(item) {
      this.componenetCheck = 3;
      this.editDialogue = true;
      this.ViewInfo = item;
    },
    create_guest_house() {
      this.componenetCheck = 1;
      this.creationDialogue = true;
    },
    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    async success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.creationDialogue = false;
      this.deleteguestDialog = false;
      this.editDialogue = false;
      this.fetch_guest_list();
    },
    async fetch_guest_list() {
      this.overlay = true;
      try {
        let result = await API.graphql(
          graphqlOperation(lit_org_guest_houses, {
            input: {
              limit: 100,
              nextToken: this.nextToken,
            },
          })
        );
        this.overlay = false;
        var response = JSON.parse(result.data.lit_org_guest_houses);

        if (response.Status == "SUCCESS") {
          this.beaches = response.data.map((beach) => ({
            name: beach.guest_house_name,
            image: beach.guest_houser_images,
            cost: beach.week_day_price,
            guest_house_description: beach.guest_house_description,
            allowed_guests: beach.allowed_guests,
            location_long: beach.location_long,
            organization_id: beach.organization_id,
            weekend_price: beach.weekend_price,
            is_price_visible: beach.is_price_visible,
            guest_house_status: beach.guest_house_status,
            guest_house_id: beach.guest_house_id,
            location_lat: beach.location_lat,
            location_pincode: beach.location_pincode,
            discounts: beach.discounts,
            location_address: beach.location_address,
            entry_logs: beach.entry_logs,
            allowed_guests: beach.allowed_guests,
            guest_house_type: beach.guest_house_type,
            payment_upi_id: beach.payment_upi_id,
            item:beach
          }));
        } else {
          this.overlay = false;
          this.beaches = [];
        }
      } catch (error) {
        // console.log(error);
      }
    },

    fetch_calender(value) {
      // console.log("value", value)
      // localStorage.setItem("calenderinfo", JSON.stringify(this.items));
      localStorage.setItem("calenderinfo", JSON.stringify(value));
      this.$router.push("/BookingCalender");
    },
  },
};
</script>

<style scoped>
.center-container {
  display: flex;
  justify-content: center;
  align-items: center; 
  height: 70vh;
  width: 100%; 
  text-align: center; 
  font-size: 20px;
}
</style>
