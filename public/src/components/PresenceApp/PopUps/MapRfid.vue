
<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="rfidMapping"
      @update:model-value="$emit('update:rfidMapping', $event)"
      persistent
      max-width="400"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black">
            <div class="custom-title">Map RFID</div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text class="mt-6">
          <v-form ref="form">
            <v-row no-gutters>
              <v-col cols="12">
                <v-radio-group v-model="toggle_exclusive" inline class="mt-n3">
                  <v-radio
                    label="Internal User"
                    value="INTERNAL_USER"
                  ></v-radio>
                  <v-radio label="Visitor" value="VISITOR"></v-radio>
                </v-radio-group>
              </v-col>
              <v-col cols="12" v-if="toggle_exclusive == 'INTERNAL_USER'">
                <div>
                  Please select the user to whom you want to assign RFID
                  <b> {{ rowInfo.rfid }}</b>
                </div>
                <v-autocomplete
                  density="compact"
                  v-model="usersName"
                  :items="loactionitems"
                  :search-input.sync="searchloc"
                  hide-no-data
                  hide-selected
                  :rules="
                    toggle_exclusive == 'INTERNAL_USER'
                      ? [(v) => !!v || 'Required']
                      : []
                  "
                  item-title="full_user_name"
                  item-value="user_id"
                  variant="outlined"
                  class="mt-2"
                />
              </v-col>
              <v-col cols="12" v-if="toggle_exclusive == 'VISITOR'">
                <div>
                  Please enter the details of the visitor to whom RFID
                  <b> {{ rowInfo.rfid }} </b> will be assigned.
                </div>
                <v-text-field
                  density="compact"
                  variant="outlined"
                  label="Name"
                  color="primaryColor"
                  v-model.trim="VisitorName"
                  :rules="
                    toggle_exclusive != 'INTERNAL_USER'
                      ? [(v) => !!v || 'Required']
                      : []
                  "
                  class="mt-2"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            :loading="loading"
            @click="delete_mutation()"
            dark
            class="text-capitalize cardCss button-corner"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
                        <script>
/* eslint-disable */
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import { update_user_rfid_details } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  mixins: [get_all_org_users],
  props: {
    rfidMapping: Boolean,
    rowInfo: Object,
  },
  emits: ['update:rfidMapping', 'clicked', 'successMsg', 'errorMsg'],
  data() {
    return {
      loading: false,
      toggle_exclusive: "INTERNAL_USER",
      usersName: "",
      searchloc: "",
      VisitorName: "",
      loactionitems: [],
    };
  },
  watch: {
    rfidMapping: {
      async handler() {
        if (this.rfidMapping == true) {
          this.toggle_exclusive = "INTERNAL_USER";
          await this.get_all_org_users();
          await this.fetch_details();
        }
      },
      immediate: true,
    },
  },
  methods: {
    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.loactionitems.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.resetValidation();
      this.$refs.form.reset();
    },
    async delete_mutation() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.loading = true;

        try {
          let result = await API.graphql(
            graphqlOperation(update_user_rfid_details, {
              input: {
                action_type: this.toggle_exclusive,
                user_id:
                  this.toggle_exclusive != "VISITOR"
                    ? this.usersName
                    : undefined,
                visitor_name:
                  this.toggle_exclusive == "VISITOR"
                    ? this.VisitorName
                    : undefined,
                rfid: this.rowInfo.rfid,
                swipe_id: this.rowInfo.swipe_id,
              },
            })
          );

          this.loading = false;

          var response = JSON.parse(result.data.update_user_rfid_details);
          this.loading = false;
          if (response.Status == "SUCCESS") {
            this.$emit("successMsg", response.Message);
            this.$refs.form.resetValidation();
            this.$refs.form.reset();
          } else {
            this.$emit("errorMsg", response.Message);
          }
        } catch (error) {
          // console.log(error)
          this.loading = false;
          this.$emit("errorMsg", error.errors[0].message);
        }
      }
    },
  },
};
</script>