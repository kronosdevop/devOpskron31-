<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="assignDialog" @update:model-value="$emit('update:assignDialog', $event)" persistent max-width="400" transition="dialog-top-transition">
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
              Assign to {{ rowData.full_user_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_data()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <!-- <div class="text-left">Are you sure you want to assign ?</div> -->
          <div class="text-left">Select Timeslots</div>
          <v-form ref="form">
            <v-row no-gutters class="mt-n3">
              <v-col class="mt-4" cols="6">
                <v-select
                  label="From"
                  v-model="fromtime"
                  dense
                  outlined
                  :rules="[(v) => !!v || 'Required']"
                  :items="slotsData"
                  item-text="time"
                  item-value="epoch"
                  return-object
                  @input="get_data(fromtime)"
                />
              </v-col>
              <v-col class="mt-4" cols="6">
                <v-select
                  label="To"
                  v-model="toTime"
                  dense
                  :rules="[(v) => !!v || 'Required']"
                  outlined
                  class="ml-2"
                  :items="filteredToTimes"
                  item-text="time"
                  item-value="epoch"
                />
              </v-col>
              <v-col v-if="slotAvalibaleCheck == false" cols="12">
                <div class="text-left">
                  <b>Not Avaliable</b>
                </div>
              </v-col>
              <v-col
                v-if="slotAvalibaleCheck == null || slotAvalibaleCheck == false"
                cols="6"
              >
                <v-btn
                  depressed
                  @click="check_data()"
                  dark
                  :loading="loading2"
                  class="cardCss text-capitalize"
                >
                  Check Availability
                </v-btn>
                <!-- <v-select
                label="To"
                v-model="toTime"
                dense
                outlined
                :items="slotsData"
                item-text="time"
                item-value="epoch"
              /> -->
              </v-col>
              <div v-if="slotAvalibaleCheck == true" class="text-left">
                <b>Slot Avaliable</b>
              </div>
              <!-- <div v-if="notAvalaible == false" class="text-left">
                <b>Not Avaliable</b>
              </div> -->

              <!-- <v-data-table
                :headers="headers"
                height="150px"
                item-key="time"
                :fixed-header="fixed"
                single-select
                :items="slotsData"
                :loading="teamLoading"
                :items-per-page="50"
                hide-default-footer
                dense
                class="elevation-1 mt-1 dtwidth custom-data-table"
              >
                <template #body="{ items }">
                  <tbody>
                    <tr
                      v-for="item in items"
                      :key="item.time"
                      @click="item.availability ? selectItem(item) : null"
                      :class="{ selectedRow: item === selectedslot }"
                    >
                      <td class="text-left">{{ item.time }}</td>
                      <td
                        :class="item.availability ? 'green--text' : 'red--text'"
                      >
                        {{ item.availability ? "YES" : "NO" }}
                      </td>
                    </tr>
                  </tbody>
                </template>
                <template v-slot:[`item.availability`]="{ item }">
                  <span v-if="item.availability == true" class="green--text"
                    >YES</span
                  >
                  <span v-else class="red--text">NO</span>
                </template>
              </v-data-table> -->

              <v-col v-if="slotAvalibaleCheck == true" cols="12">
                <v-textarea
                  auto-grow
                  dense
                  rows="0"
                  outlined
                  class="mt-3"
                  v-model="assignerComments"
                  label="Comments"
                />
              </v-col>
              <v-col v-if="slotAvalibaleCheck == true" cols="12">
                <v-checkbox class="mt-n2" v-model="checkbox">
                  <template #label>
                    <div>Is it Priority ?</div>
                  </template>
                </v-checkbox>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions v-if="slotAvalibaleCheck == true" class="justify-end">
          <v-btn
            depressed
            :loading="loading1"
            @click="asssign_data()"
            dark
            class="cardCss button-corner text-capitalize"
          >
            Yes
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/*eslint-disable*/
import { assign_tickets } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { get_user_ticket_details } from "@/graphql/queries.js";
export default {
  props: {
    assignDialog: Boolean,
    rowInfo: Object,
    rowData: Object,
    timeslotsData: Object,
  },

  data() {
    return {
      assignerComments: "",
      loading1: false,
      checkbox: false,
      hours: [],
      teamLoading: false,
      slotsData: [],
      headers: [
        { text: "Time Slots", value: "time", sortable: false },
        {
          text: "Availability",
          value: "availability",
          sortable: false,
        },
      ],
      fixed: true,
      selectedslot: null,
      selectedId: -1,
      selectedItem: null,
      fromtime: "",
      toTime: "",
      loading2: false,
      slotAvalibaleCheck: null,
      toTimeSlots: [],
      globalArray: [],
      // notAvalaible: null,
    };
  },
  watch: {
    assignDialog: {
      async handler() {
        // console.log(this.rowData);
        if (this.assignDialog == true) {
          this.slotsData = this.timeslotsData.all_timeslots;
          // this.fetch_time_slots(this.slotsData);
        }
      },
      immediate: true,
    },
  },

  computed: {
    filteredToTimes() {
      // Find the index of the selected value in the first array
      const index = this.slotsData.indexOf(this.fromtime);

      // Return a subarray starting from the next index
      return index !== -1 ? this.slotsData.slice(index + 1) : [];
    },
  },

  methods: {
    fetch_time_slots(value) {
      this.globalArray = [];
      value.forEach((element) => {
        this.globalArray.push(element.time);
      });
      // console.log(this.globalArray);
    },

    get_data(value) {
      // for (var i = value.time; i > this.globalArray.length; )
      //   console.log(this.globalArray.filter((time) => time !== value.time));
    },

    close_data() {
      this.fromtime = "";
      this.toTime = "";
      this.checkbox = false;
      this.assignerComments = "";
      this.$refs.form.reset();
      this.slotAvalibaleCheck = null;
      this.$emit("clicked", 0);
    },

    check_data() {
      if (this.$refs.form.validate()) {
        this.check_avaliability();
      }
    },

    async check_avaliability() {
      this.loading2 = true;
      try {
        let result = await API.graphql(
          graphqlOperation(get_user_ticket_details, {
            input: {
              user_id: this.rowData.user_id,
              action_type: "VALIDATE_SLOT",
              ticket_id: this.rowInfo.ticket_id,
              today_date: this.fetch_current_date1(),
              offset: new Date().getTimezoneOffset() * 60,
              start_epoch: this.fromtime.epoch,
              end_epoch: this.toTime,
            },
          })
        );

        var response = JSON.parse(result.data.get_user_ticket_details);
        this.loading2 = false;
        if (response.Status == "SUCCESS") {
          this.slotAvalibaleCheck = response.slot_available;
        } else {
          this.slotAvalibaleCheck = response.slot_available;

          this.tableLoading = false;
        }
      } catch (error) {
        // this.tableLoading = false;
      }
    },

    fetch_current_date1() {
      const currentDate = new Date();
      const year = currentDate.getFullYear().toString().padStart(4, "0");
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
      const day = currentDate.getDate().toString().padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}`;

      return formattedDate;
    },

    selectItem(item) {
      this.selectedslot = item;
    },

    async asssign_data() {
      this.loading1 = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(assign_tickets, {
            input: {
              assigned_user_id: this.rowData.user_id,
              ticket_id: this.rowInfo.ticket_id,
              assigned_dynamo_date: await this.fetch_current_date1(),
              admin_comments: this.assignerComments,
              ticket_assign_by: data.user.user_email_id,
              is_urgent: this.checkbox,
              slot_start_time: this.fromtime.epoch,
              slot_end_time: this.toTime,
            },
          })
        );
        var response = JSON.parse(result.data.assign_tickets);
        this.loading1 = false;
        if (response.Status == "SUCCESS") {
          this.loading1 = false;
          this.fromtime = "";
          this.toTime = "";
          this.checkbox = false;
          this.assignerComments = "";
          this.$emit("successMsg", response.Message);
        } else {
          this.loading1 = false;
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);

        this.loading1 = false;
      }
    },

    fetch_current_date1() {
      const currentDate = new Date();
      const year = currentDate.getFullYear().toString().padStart(4, "0");
      const month = (currentDate.getMonth() + 1).toString().padStart(2, "0"); // Months are zero-based
      const day = currentDate.getDate().toString().padStart(2, "0");

      const formattedDate = `${year}-${month}-${day}`;

      return formattedDate;
    },
  },
};
</script>
<style scoped>
.list-container {
  height: 150px;
  border: 1px solid #ccc;
  overflow-y: auto;
}
.selectedRow {
  background-color: rgb(62, 233, 221);
  font-weight: bold;
}
</style>