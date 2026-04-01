<template>
  <!-- eslint-disable -->
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card flat>
      <v-card-text class="mt-4">
        <v-row class="ml-2">
          <v-col cols="6">
            <v-form ref="form">
              <v-row>
                <v-col
                  cols="12"
                  v-if="
                    $store.getters.Getdashboarditems.dashboard_created_by ==
                    $store.getters.GetUserObj.user.user_email_id
                  "
                >
                  <v-text-field
                    outlined
                    :readonly="isUserReadOnly"
                    dense
                    style="max-width: 600px"
                    label="Name"
                    :rules="[(v) => !!v || 'Required']"
                    :counter="25"
                    v-model="dashboard_name"
                  />
                  <v-textarea
                    outlined
                    dense
                    :readonly="isUserReadOnly"
                    :rules="[(v) => !!v || 'Required']"
                    style="max-width: 600px"
                    label="Description"
                    class="mt-n2"
                    v-model="description"
                  />

                  <v-col cols="12">
                    <v-row>
                      <v-col cols="10">
                        <v-select
                          outlined
                          :items="types_item"
                          :readonly="isUserReadOnly"
                          dense
                          style="max-width: 550px"
                          class="ml-n2 mt-n4"
                          label="Type"
                          v-model="dashboard_type"
                        />
                      </v-col>
                      <v-col cols="2">
                        <v-tooltip bottom>
                          <template #activator="{ on, attrs }">
                            <v-icon class="mt-n1" v-bind="attrs" v-on="on"
                              >mdi-help-circle</v-icon
                            >
                          </template>
                          <span
                            >Open<br />
                            Restricted</span
                          >
                        </v-tooltip>
                      </v-col>
                      <v-col cols="12">
                        <v-text-field
                          v-if="dashboard_type == 'RESTRICTED'"
                          outlined
                          :readonly="isUserReadOnly"
                          dense
                          :rules="[(v) => !!v || 'Required']"
                          style="max-width: 600px"
                          label="Password"
                          class="ml-n2 mt-n4"
                          v-model="Password"
                        />
                      </v-col>
                    </v-row>
                  </v-col>
                </v-col>
                <v-col cols="12" v-else>
                  <v-row>
                    <v-col cols="12">
                      <label class="font-weight-bold">Name : </label>
                      <br />
                      <span>{{ dashboard_name }}</span>
                    </v-col>
                    <v-col cols="12">
                      <label class="font-weight-bold">Description : </label>
                      <br />
                      <span>{{ description }}</span>
                    </v-col>
                    <v-col cols="12">
                      <label class="font-weight-bold">Type : </label>
                      <br />
                      <span>{{ dashboard_type }}</span>
                    </v-col>
                    <v-col cols="12">
                      <label class="font-weight-bold">Password : </label>
                      <br />
                      <span>{{ Password }}</span>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-form>
          </v-col>
          <v-col cols="6">
            <v-card-text align="center">
              <div class="font-weight-black">QR Code</div>
              <div
                style="border: 1px solid black; max-width: fit-content"
                class="pa-3 mt-8 mb-8"
              >
                <VueQRCodeComponent
                  :text="member_qr"
                  error-level="H"
                  :size="150"
                ></VueQRCodeComponent>
              </div>
              <span class="font-weight-bold">
                {{ $store.getters.Getdashboarditems.dashboard_name }}
              </span>
            </v-card-text>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="justify-start ml-10">
        <v-btn
          depressed
          :loading="loading"
          @click="edit_mutation()"
          v-show="
            $store.getters.Getdashboarditems.dashboard_created_by ==
            $store.getters.GetUserObj.user.user_email_id
          "
          dark
          class="cardCss button-corner text-capitalize"
        >
          save
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import SnackBar from "@/components/SnackBar.vue";
import VueQRCodeComponent from "vue-qrcode-component";
import { edit_or_delete_dashboard_topic } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
export default {
  // props: {
  //   custom_details: Object,
  // },
  components: { VueQRCodeComponent, SnackBar },
  data() {
    return {
      loading: false,
      dashboard_name: "",
      description: "",
      dashboard_type: "",
      member_qr: "",
      Password: "",
      types_item: ["OPEN", "RESTRICTED"],
      SnackBarComponent: {},
      isUserReadOnly: false,
    };
  },
  // watch: {
  //   edit_properties: {
  //     async handler() {
  //       if (this.edit_properties == true) {
  //         (this.dashboard_name = this.custom_details.dashboard_name),
  //           (this.description = this.custom_details.dashboard_description),
  //           (this.dashboard_type = this.custom_details.dashboard_security);
  //         this.Password = this.custom_details.dashboard_password;
  //       }
  //     },
  //     immediate: true,
  //   },
  // },
  created() {
    this.dashboard_name = this.$store.getters.Getdashboarditems.dashboard_name;
    this.description =
      this.$store.getters.Getdashboarditems.dashboard_description;
    this.dashboard_type =
      this.$store.getters.Getdashboarditems.dashboard_security;
    this.Password = this.$store.getters.Getdashboarditems.dashboard_password;
    this.member_qr = this.$store.getters.Getdashboarditems.dashboard_link;
    if (
      this.$store.getters.Getdashboarditems.dashboard_created_by !=
      this.$store.getters.GetUserObj.user.user_email_id
    ) {
      this.isUserReadOnly = true;
    }
  },

  methods: {
    edit_mutation() {
      if (this.$refs.form.validate()) {
        this.Edit_edash_board();
      }
    },
    async Edit_edash_board() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_or_delete_dashboard_topic, {
            input: {
              action_type: "EDIT",
              dashboard_id: this.$store.getters.Getdashboarditems.dashboard_id,
              organization_id: data.organization.organization_id,
              dashboard_name: this.dashboard_name,
              dashboard_security: this.dashboard_type,
              dashboard_description: this.description,
              dashboard_password:
                this.dashboard_type == "RESTRICTED" ? this.Password : "NONE",
              user_email_id: data.user.user_email_id,
            },
          })
        );
        var response = JSON.parse(result.data.edit_or_delete_dashboard_topic);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          // this.$emit("successMsg", response.Message);
          // this.$refs.form.reset();
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };

          // this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.$emit("errorMsg", error.errors[0].message);
        this.loading = false;
      }
    },
  },
};
</script>

<style>
</style>