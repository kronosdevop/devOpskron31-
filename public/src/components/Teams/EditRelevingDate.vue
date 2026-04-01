<template>
  <!-- eslint-disable -->
  <v-dialog :model-value="relivedDilaog" @update:model-value="$emit('update:relivedDilaog', $event)" persistent max-width="500" transition="dialog-top-transition">
    <div>
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">
            {{
              " Edit Reliving Date for" + " " + rowInfo.full_user_name
            }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-4">
          <v-row>
            <v-col cols="12">
              <v-text-field
                :model-value="displayFormatDate(date)"
                label="Relieving Date"
                prepend-icon="mdi-calendar"
                readonly
                variant="outlined"
                density="compact"
                @click="menu = true"
              />
              <v-dialog v-model="menu" persistent max-width="325">
                <v-card>
                  <v-date-picker
                    v-model="tempDate"
                    :max="today"
                    color="primary"
                  />
                  <v-card-actions>
                    <v-spacer />
                    <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="saveDate">OK</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            depressed
            :loading="loading"
            @click="active_deactive_actions()"
            dark
            class="cardCss"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-dialog>
</template>
<script>
/* eslint-disable */
import { edit_user } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  props: {
    relivedDilaog: Boolean,
    rowInfo: Object,
  },
  data() {
    return {
      menu: false,
      date: "", // always in YYYY-MM-DD
      tempDate: null, // for dialog selection
      loading: false,
    };
  },
  computed: {
    today() {
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, "0");
      const day = today.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
  },
  watch: {
    relivedDilaog: {
      immediate: true,
      handler() {
        if (this.relivedDilaog) {
          if (this.rowInfo.relieving_date) {
            // convert epoch to YYYY-MM-DD
            this.date = this.formatDate(new Date(this.rowInfo.relieving_date * 1000));
            this.tempDate = this.date;
          } else {
            this.date = "";
            this.tempDate = null;
          }
        }
      },
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    displayFormatDate(date) {
      if (!date || typeof date !== "string") return "";
      const [year, month, day] = date.split("-");
      if (year && month && day) {
        return `${day}-${month}-${year}`;
      }
      return date;
    },
    formatDate(date) {
      // Accepts a Date object or string, returns YYYY-MM-DD
      if (!date) return "";
      const d = new Date(date);
      if (isNaN(d)) return "";
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    saveDate() {
      if (this.tempDate) {
        this.date = this.formatDate(this.tempDate);
      }
      this.menu = false;
    },
    async active_deactive_actions() {
      this.loading = true;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_user, {
            input: {
              user_id: this.rowInfo.user_id,
              organization_id:
                this.$store.getters.GetUserObj.organization.organization_id,
              relieving_date: this.date ? this.fethc_time(this.date) : null,
            },
          })
        );
        var response = JSON.parse(result.data.edit_user);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
    fethc_time(value) {
      var dateObject = new Date(value);
      var epochTimestamp = Math.floor(dateObject.getTime() / 1000);
      return parseInt(epochTimestamp);
    },
  },
};
</script>