<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />

    <v-card class="mt-4" flat outlined>
      <v-card-text v-show="showEditPart == 0">
        <OverlayComp :overlay="overlay" />

        <v-row no-gutters>
          <v-col cols="6">
            <v-col cols="12">
              <div class="primary--text">
                <b>Directory Details</b>
                <v-icon
                  v-show="
                    $store.getters.GetFormObject.directory_created_by ==
                    $store.getters.GetUserObj.user.user_email_id
                  "
                  class="ml-4 mt-n2"
                  color="primary"
                  @click="edit_directory_details()"
                  >mdi-pencil</v-icon
                >
              </div>
            </v-col>
            <v-divider />
            <v-col cols="12">
              <div>
                <b>Directory Name</b> :
                {{ directoryName }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Directory Description</b> :
                {{ directoryDescriptionDisplay }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>#Subscribers</b> :
                {{ directorySubscribeCount }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Visibility </b> :
                {{ directoryVisibility }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>#Entries</b> :
                {{ directoryEntries }}
              </div>
            </v-col>
            <!-- <v-col cols="12">
              <div>
                <b>Entries Sort Order</b> :
                {{ directorySortOrder }}
              </div>
            </v-col> -->
            <v-col cols="12">
              <div>
                <b>Created By</b> :
                {{ fetch_name(directoryCreatedBy) }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Created On</b> :
                {{ get_date(directoryCreatedOn) }}
              </div>
            </v-col>
          </v-col>

          <v-col cols="6">
            <v-col cols="12">
              <div class="primary--text">
                <b>Directory Entry Settings</b>
              </div>
            </v-col>
            <v-divider class="ml-2" />
            <v-col cols="12">
              <div>
                <b>Entries Sort Order</b> :
                {{ directorySortOrder }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Entries Geo tagged</b> :
                {{ geoSettings }}
              </div>
            </v-col>

            <v-col cols="12">
              <div>
                <b>Add Entry Approval</b> :
                {{ addEntrySettings }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Update Entry Approval</b> :
                {{ updateEntrySettings }}
              </div>
            </v-col>
            <v-col cols="12">
              <div>
                <b>Delete Entry Approval</b> :
                {{ deleteEntrySettings }}
              </div>
            </v-col>
            <v-col v-show="entryByAllMembers == true" cols="12">
              <div>
                <b>Form entry creation by all members</b> :
                {{ entryByAllMembers == true ? "Enabled" : "Disabled" }}
              </div>
            </v-col>
            <v-col v-show="entryByExternalMembers == true" cols="12">
              <div>
                <b>Form entry creation by external members</b> :

                {{ entryByExternalMembers == true ? "Enabled" : "Disabled" }}
              </div>
            </v-col>
            <v-col v-show="entryByExternalMembers == true" cols="12">
              <div>
                <b>External Url</b> :

                <span ref="textInputurl">{{ externalUrl }}</span>
                <v-btn size="small" @click="copyToClipboard_url()" color="primary"
                  ><v-icon size="small">mdi-content-copy</v-icon></v-btn
                >
              </div>
            </v-col>
            <v-col v-show="entryByExternalMembers == true" cols="12">
              <div>
                <b>External Form Name</b> :
                {{ externalFormName }}
              </div>
            </v-col>
            <v-col v-show="entryByExternalMembers == true" cols="12">
              <div
                style="border: 1px solid black; max-width: fit-content"
                class="pa-3 mb-1 mt-n2"
              >
                <VueQRCodeComponent
                  ref="qrCode"
                  :text="externalUrl"
                  error-level="H"
                  :size="150"
                ></VueQRCodeComponent>
              </div>
              <v-btn
                @click="download_qr_code()"
                dark
                fab
                elevation="0"
                x-small
                color="primary"
              >
                <v-icon dark> mdi-download</v-icon>
              </v-btn>
            </v-col>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-text v-show="showEditPart == 1">
        <v-toolbar elevation="0" dark dense class="navBar bg-white">
          <v-toolbar-title class="text--black ml-2">
            <div class="custom-title">Edit Directory</div>
          </v-toolbar-title>
          <v-spacer />
          <v-icon class="icon-class" @click="previous_card()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-stepper v-model="directorySettings">
            <v-stepper-header>
              <v-stepper-step :complete="directorySettings > 1" step="1">
                Directory Settings
              </v-stepper-step>
              <v-divider></v-divider>
              <v-stepper-step :complete="directorySettings > 2" step="2">
                Entry Settings
              </v-stepper-step>
            </v-stepper-header>
            <v-stepper-items>
              <v-stepper-content step="1">
                <v-card v-if="directorySettings == 1" flat>
                  <v-card-text>
                    <v-form ref="forms">
                      <v-row no-gutters>
                        <v-col cols="12">
                          <v-text-field
                            @input="get_directory_name(directroyName)"
                            label="Directory Name"
                            density="compact"
                            class="mt-2"
                            variant="outlined"
                            :rules="[(v) => !!v || 'Required']"
                            v-model="directroyName"
                          />
                        </v-col>
                        <v-col cols="12">
                          <v-textarea
                            rows="2"
                            auto-grow
                            density="compact"
                            variant="outlined"
                            :rules="[(v) => !!v || 'Required']"
                            label="Directory Description"
                            v-model="directoryDescription"
                          />
                        </v-col>
                      </v-row>
                    </v-form>
                    <v-card-actions class="justify-end">
                      <v-btn color="primary" @click="validate_data()"> Continue </v-btn>
                    </v-card-actions>
                  </v-card-text>
                </v-card>
              </v-stepper-content>
              <v-stepper-content step="2">
                <v-card v-if="directorySettings == 2" flat>
                  <v-card-text>
                    <v-form ref="form1">
                      <v-row no-gutters>
                        <v-col cols="6">
                          Entries in the directory are/can be -
                          <v-radio-group v-model="geoEntries" row>
                            <v-radio label="Non Geo-tagged" value="nongeoTagged"></v-radio>
                            <v-radio label="Geo-tagged" value="geotagged"></v-radio>
                          </v-radio-group>
                        </v-col>
                        <v-col cols="6">
                          Entries in the directory are sorted by -
                          <v-select
                            label=""
                            class="mt-3"
                            v-model="sortOrderData"
                            :items="[
                              { title: 'Title (alphabetical, ascending)', value: 'title_alphabetical' },
                              { title: 'Title (alphabetical, descending)', value: 'title_alphabetical_descending' },
                              { title: 'Created/Updated on (ascending)', value: 'updated_on_ascending' },
                              { title: 'Created/Updated on (descending)', value: 'updated_on_descending' },
                            ]"
                            variant="outlined"
                            density="compact"
                          />
                        </v-col>
                        <v-col cols="6">
                          Entries require workflow approval -
                          <v-radio-group v-model="workflowApproval" row>
                            <v-radio label="Yes" value="yes"></v-radio>
                            <v-radio label="NO" value="no"></v-radio>
                          </v-radio-group>
                          <v-row no-gutters>
                            <v-col v-if="workflowApproval == 'yes'" cols="12">
                              <v-row no-gutters>
                                <v-col cols="4">
                                  <v-checkbox
                                    density="compact"
                                    v-model="newEntry"
                                    label="Adding New Entry"
                                    color="primary"
                                    hide-details
                                  ></v-checkbox>
                                </v-col>
                                <v-col cols="8">
                                  <v-autocomplete
                                    v-show="newEntry"
                                    class="mt-2"
                                    density="compact"
                                    label="Select Approval For Adding Entry"
                                    v-model="newEntryUSer"
                                    :menu-props="{ maxHeight: '200' }"
                                    variant="outlined"
                                    :items="userList"
                                    item-title="full_user_name"
                                    item-value="user_id"
                                    v-model:search-input="searchf"
                                    @input="searchf = ''"
                                  >
                                  </v-autocomplete>
                                </v-col>
                                <v-col cols="4">
                                  <v-checkbox
                                    density="compact"
                                    v-model="updateEntry"
                                    label="Updating Entry"
                                    color="primary"
                                    hide-details
                                  ></v-checkbox>
                                </v-col>
                                <v-col cols="8">
                                  <v-autocomplete
                                    v-show="updateEntry"
                                    class="mt-2"
                                    label="Select Approval for Updating Entry"
                                    v-model="updateUser"
                                    :menu-props="{ maxHeight: '200' }"
                                    variant="outlined"
                                    density="compact"
                                    :items="userList"
                                    item-title="full_user_name"
                                    item-value="user_id"
                                    v-model:search-input="searchg"
                                    @input="searchg = ''"
                                  >
                                  </v-autocomplete>
                                </v-col>
                                <v-col cols="4">
                                  <v-checkbox
                                    density="compact"
                                    v-model="deleteEntry"
                                    label="Delete Entry"
                                    color="primary"
                                    hide-details
                                  ></v-checkbox>
                                </v-col>
                                <v-col cols="8">
                                  <v-autocomplete
                                    v-show="deleteEntry"
                                    class="mt-2"
                                    density="compact"
                                    label="Select Approval For Deleting Entry"
                                    v-model="deleteUser"
                                    :menu-props="{ maxHeight: '200' }"
                                    variant="outlined"
                                    :items="userList"
                                    item-title="full_user_name"
                                    item-value="user_id"
                                    v-model:search-input="searchh"
                                    @input="searchh = ''"
                                  >
                                  </v-autocomplete>
                                </v-col>
                              </v-row>
                            </v-col>
                          </v-row>
                        </v-col>
                        <v-col v-show="entryByExternalMembers == true" cols="6">
                          Form Settings -
                          <v-text-field
                            v-show="entryByExternalMembers == true"
                            density="compact"
                            :rules="entryByExternalMembers == true ? [(v) => !!v || 'Required'] : []"
                            class="mt-2"
                            variant="outlined"
                            v-model="externalFormName"
                            label="External Form Name"
                          />
                        </v-col>
                        <v-col cols="6" v-if="externalFormNameUpdated == ''">
                          Form Settings -
                          <v-checkbox
                            density="compact"
                            class="mt-n1"
                            v-model="entryByExternalMembers"
                            label="Allow Entry creation by External members"
                          ></v-checkbox>
                        </v-col>
                      </v-row>
                    </v-form>
                    <v-card-actions class="justify-end mt-1">
                      <v-btn color="primary" @click="back_action()"> Back </v-btn>
                      <v-btn
                        color="primary"
                        :loading="loadingbtn"
                        class="ml-2"
                        @click="save_mutation()"
                      >
                        Confirm
                      </v-btn>
                    </v-card-actions>
                  </v-card-text>
                </v-card>
              </v-stepper-content>
            </v-stepper-items>
          </v-stepper>
        </v-card-text>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
/* eslint-disable */
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
import VueQRCodeComponent from "vue-qrcode-component";
import { format_Date } from "@/JsonFiles/DateFormate.js";
import VueHtml2pdf from "vue-html2pdf";
import {
  update_directory,
  custom_directory_design,
} from "@/graphql/mutations.js";
import { get_particular_directory } from "@/graphql/queries.js";
// import { update_audit_logs } from "@/mixins/AuditLogActions.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";
import OverlayComp from "@/components/OverlayComp.vue";
export default {
  mixins: [
    get_all_org_users,
    //  update_audit_logs
  ],
  components: {
    SnackBar,
    OverlayComp,
    VueQRCodeComponent,
    VueHtml2pdf,
  },
  data() {
    return {
      showEditPart: 0,
      directorySettings: 1,
      directoryDescription: "",
      directroyName: "",
      externalFormNameUpdated: "",
      geoEntries: "nongeoTagged",
      sortOrderData: "title_alphabetical",
      loadingbtn: false,
      directoryVisbility: null,
      userList: [],
      search: "",
      userDetails: [],
      entryApproval: null,
      workflowApproval: "no",
      newEntry: true,
      updateEntry: true,
      deleteEntry: true,
      selectUsers: [],
      deleteUser: "",
      updateUser: "",
      newEntryUSer: "",
      searchf: "",
      searchg: "",
      searchh: "",
      SnackBarComponent: {},
      directoryCreatedOn: "",
      directoryCreatedBy: "",
      directoryEntries: "",
      directorySubscribeCount: "",
      directoryName: "",
      directoryDescriptionDisplay: "",
      directoryDetails: {},
      visibilityUsers: [],
      directorySortOrder: "",
      directoryVisibility: "",
      allUsers: [],
      overlay: false,
      geoSettings: "",
      approvalSettings: "",
      deleteEntrySettings: "",
      updateEntrySettings: "",
      addEntrySettings: "",
      entryByExternalMembers: false,
      entryByAllMembers: false,
      externalUrl: "",
      externalFormName: "",
    };
  },

  async created() {
    this.overlay = true;
    this.$store.commit("Setnamesearch", "");

    await this.get_all_org_users();
    this.fetch_details();
    this.fetch_directory_details();
  },
  watch: {
    newEntry: function (newValue) {
      if (!newValue && !this.updateEntry && !this.deleteEntry) {
        this.workflowApproval = "no";
      }
    },

    updateEntry: function (newValue) {
      if (!newValue && !this.newEntry && !this.deleteEntry) {
        this.workflowApproval = "no";
      }
    },

    deleteEntry: function (newValue) {
      if (!newValue && !this.newEntry && !this.updateEntry) {
        this.workflowApproval = "no";
      }
    },
  },

  methods: {
    onuserinput(value) {
      if (!value.includes(this.$store.getters.GetUserObj.user.user_id)) {
        value.push(this.$store.getters.GetUserObj.user.user_id);
      }
      this.userDetails = value;
      this.search = "";
    },

    copyToClipboard_url() {
      const spanElement = this.$refs.textInputurl;
      const text = spanElement.innerText;
      if (navigator.clipboard) {
        navigator.clipboard
          .writeText(text)
          .then(() => {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: "Copied to clipboard",
              timeout: 5000,
              Top: true,
            };
            // console.log("Text copied to clipboard");
            // this.$emit("clicked", 1);
          })
          .catch((err) => {
            console.error("Failed to copy text: ", err);
          });
      } else {
        console.error("Clipboard API not supported in this browser.");
      }
    },

    downloadPDF() {
      const element = this.$refs.contentToPrint;

      // Use vue-html2pdf to convert HTML to PDF and trigger download
      this.$refs.html2pdf.generatePdf(element).then(() => {
        // Optional: Add any additional actions after PDF generation
      });
    },

    // download_qr_code() {
    //   const qrCodeComponent = this.$refs.qrCode;
    //   const qrCodeCanvas = qrCodeComponent.$el.querySelector("canvas");
    //   console.log(qrCodeCanvas);
    //   if (!qrCodeCanvas) {
    //     console.error("QR code canvas not found");
    //     return;
    //   }
    //   const title = this.externalFormName; // Replace with your dynamic title or text
    //   const fontSize = 20; // Font size for the title
    //   const scale = 2;
    //   const width = 250 * scale;
    //   const height = 250 * scale;
    //   const highResCanvas = document.createElement("canvas");
    //   highResCanvas.width = width;
    //   highResCanvas.height = height;
    //   const ctx = highResCanvas.getContext("2d");

    //   ctx.drawImage(qrCodeCanvas, 0, 0, width, height);
    //   const dataURL = highResCanvas.toDataURL("image/png");
    //   const link = document.createElement("a");
    //   link.href = dataURL;
    //   link.download = this.externalFormName + ".png";
    //   link.click();
    // },
    download_qr_code() {
      const qrCodeComponent = this.$refs.qrCode;
      const qrCodeCanvas = qrCodeComponent.$el.querySelector("canvas");

      if (!qrCodeCanvas) {
        console.error("QR code canvas not found");
        return;
      }

      const title = this.externalFormName; // Replace with your dynamic title or text
      const fontSize = 50; // Font size for the title
      const scale = 2; // Scale factor for higher resolution
      const qrCodeSize = 200; // Original size of the QR code canvas
      const outlineWidth = 5; // Width of the border around the QR code
      const borderSpacing = 10; // Spacing between QR code and border
      const titleToQRCodeSpacing = 30; // Spacing between the title and the QR code

      // Calculate canvas dimensions and positions
      const width = qrCodeSize * scale + 2 * (outlineWidth + borderSpacing); // Add space for border and spacing
      const height =
        qrCodeSize * scale +
        fontSize +
        20 +
        2 * (outlineWidth + borderSpacing) +
        titleToQRCodeSpacing; // Extra space for title, border, and spacing
      const highResCanvas = document.createElement("canvas");
      highResCanvas.width = width;
      highResCanvas.height = height;
      const ctx = highResCanvas.getContext("2d");

      // Draw the title with outline
      const titleOffset = 2; // Offset for text outline
      ctx.font = `${fontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Draw outline for title
      ctx.fillStyle = "black";
      ctx.fillText(title, width / 2 + titleOffset, fontSize / 2 + titleOffset);
      ctx.fillText(title, width / 2 - titleOffset, fontSize / 2 - titleOffset);
      ctx.fillText(title, width / 2 + titleOffset, fontSize / 2 - titleOffset);
      ctx.fillText(title, width / 2 - titleOffset, fontSize / 2 + titleOffset);

      // Draw the title
      ctx.fillStyle = "white"; // Title color
      ctx.fillText(title, width / 2, fontSize / 2);

      // Draw the QR code on the canvas with spacing
      const qrCodeX = outlineWidth + borderSpacing; // Position of QR code with border spacing
      const qrCodeY =
        fontSize + 10 + titleToQRCodeSpacing + outlineWidth + borderSpacing; // Position of QR code with spacing from title
      ctx.drawImage(
        qrCodeCanvas,
        qrCodeX,
        qrCodeY,
        qrCodeSize * scale, // Use scale factor for width
        qrCodeSize * scale // Use scale factor for height
      );

      // Draw border around the QR code with spacing
      ctx.strokeStyle = "black";
      ctx.lineWidth = outlineWidth;
      ctx.strokeRect(
        qrCodeX - borderSpacing, // Adjust for spacing
        qrCodeY - borderSpacing, // Adjust for spacing
        qrCodeSize * scale + 2 * borderSpacing, // Add space for border on each side
        qrCodeSize * scale + 2 * borderSpacing // Add space for border on each side
      );

      const dataURL = highResCanvas.toDataURL("image/jpg");
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `${this.externalFormName}.jpg`; // Use your dynamic name for the file
      link.click();
    },

    async fetch_directory_details() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(get_particular_directory, {
            input: {
              directory_id: this.$store.getters.GetFormObject.directory_id,
            },
          })
        );
        this.orgUsers = [];
        var response = JSON.parse(result.data.get_particular_directory);
        this.overlay = false;
        this.$store.commit("SetFormObj", response.Data[0]);
        this.directoryCreatedOn = response.Data[0].directory_created_on;
        this.directoryCreatedBy = response.Data[0].directory_created_by;
        this.directoryEntries = response.Data[0].directory_entries;
        this.directorySortOrder = this.fetch_sor_order_data(
          response.Data[0].directory_sort_order
        );
        // this.directorySortOrder = response.Data[0].directory_sort_order;
        this.directorySubscribeCount =
          response.Data[0].directory_subscriber_count;
        this.directoryDescriptionDisplay =
          response.Data[0].directory_description;
        this.directoryName = response.Data[0].directory_name;

        this.directoryVisibility =
          response.Data[0].directory_visibility_type == "USERS"
            ? "Restricted Users" +
              " " +
              "(" +
              this.fetch_names(response.Data[0].directory_visibility_users) +
              ")"
            : "All Members";
        this.geoSettings =
          response.Data[0].is_geo_tagged == true ? "Yes" : "No";
        this.approvalSettings =
          response.Data[0].directory_workflow_approval == true ? "Yes" : "No";
        this.entryByExternalMembers =
          response.Data[0].is_directory_enabled_as_extrenal_form == undefined
            ? false
            : response.Data[0].is_directory_enabled_as_extrenal_form;
        this.entryByAllMembers =
          response.Data[0].is_directory_enabled_as_form == undefined
            ? false
            : response.Data[0].is_directory_enabled_as_form;
        this.addEntrySettings =
          this.approvalSettings == "Yes" &&
          response.Data[0].directory_addEntry_workflow_approval == true
            ? this.fetch_admin_names(response.Data[0].directory_add_entry_admin)
            : "No";
        this.deleteEntrySettings =
          this.approvalSettings == "Yes" &&
          response.Data[0].directory_deleteEntry_workflow_approval == true
            ? this.fetch_admin_names(
                response.Data[0].directory_delete_entry_admin
              )
            : "No";
        this.updateEntrySettings =
          this.approvalSettings == "Yes" &&
          response.Data[0].directory_editEntry_workflow_approval == true
            ? this.fetch_admin_names(
                response.Data[0].directory_edit_entry_admin
              )
            : "No";
        if (response.Data[0].EXTERNAL_URL) {
          this.externalUrl = response.Data[0].EXTERNAL_URL.replace(
            /^https?:\/\//,
            ""
          );
        } else {
          this.externalUrl = response.Data[0].External_url.replace(
            /^https?:\/\//,
            ""
          );
        }

        this.externalFormName =
          response.Data[0].external_form_name == undefined
            ? ""
            : response.Data[0].external_form_name;
        this.externalFormNameUpdated =
          response.Data[0].external_form_name == undefined
            ? ""
            : response.Data[0].external_form_name;
        // console.log(response.Data[0]);
      } catch (error) {}
    },

    fetch_names(ids) {
      var names = [];
      for (var i = 0; i < ids.length; i++) {
        var id = ids[i];
        for (var j = 0; j < this.allUsers.length; j++) {
          if (this.allUsers[j].user_id === id) {
            names.push(this.allUsers[j].full_user_name);
            break; // Break the inner loop once match is found
          }
        }
      }

      return names;
    },
    fetch_name(email) {
      var userName = "";
      for (var i = 0; i < this.allUsers.length; i++) {
        if (this.allUsers[i].user_email_id == email) {
          userName = this.allUsers[i].full_user_name;
        }
      }
      return userName;
    },

    fetch_admin_names(id) {
      var name = "";
      for (var i = 0; i < this.allUsers.length; i++) {
        if (this.allUsers[i].user_id == id) {
          name = this.allUsers[i].full_user_name;
        }
      }
      return name;
    },

    fetch_sor_order_data(value) {
      if (value == "title_alphabetical") {
        return "Title (alphabetical, ascending)";
      } else if (
        value == "updated_on_ascending" ||
        value == "created_on_ascending"
      ) {
        return "Created/Updated on (ascending)";
      } else if (value == "updated_on_descending") {
        return "Created/Updated on (descending)";
      } else if (value == "title_alphabetical_descending") {
        return "Title (alphabetical, descending)";
      }
    },

    clear_value() {
      var data = this.$store.getters.GetUserObj;
      if (this.directoryVisbility == "ALL_MEMBERS") {
        this.userDetails = [];
      } else {
        this.userList.forEach((element) => {
          if (element.user_id != data.user.user_id) {
            this.visibilityUsers.push({
              full_user_name: element.full_user_name,
              user_id: element.user_id,
            });
          }
        });
      }
    },

    get_date(val) {
      return format_Date(val);
    },

    async edit_directory_details() {
      this.showEditPart = 1;
      this.directorySettings = 1;
      this.$store.commit("Setnamesearch", "");
      var data = this.$store.getters.GetUserObj;

      this.fetch_existting_directory_info();
    },

    get_directory_name(value) {
      this.directoryDescription = value;
    },

    async validate_data() {
      const { valid } = await this.$refs.forms.validate();
      if (valid) {
        this.directorySettings = 2;
      }
    },

    back_action() {
      this.directorySettings = 1;
    },

    previous_card() {
      this.showEditPart = 0;
    },

    fetch_existting_directory_info() {
      var data = this.$store.getters.GetFormObject;
      var userObj = this.$store.getters.GetUserObj;
      this.directroyName = data.directory_name;
      this.directoryDescription = data.directory_description;
      this.directoryVisbility = data.directory_visibility_type;
      this.userDetails =
        data.directory_visibility_type == "USERS"
          ? data.directory_visibility_users
          : [];
      this.geoEntries =
        data.is_geo_tagged == false ? "nongeoTagged" : "geotagged";
      this.workflowApproval =
        data.directory_workflow_approval == false ? "no" : "yes";
      this.newEntry =
        this.workflowApproval == "yes"
          ? data.directory_addEntry_workflow_approval
          : true;
      this.updateEntry =
        this.workflowApproval == "yes"
          ? data.directory_editEntry_workflow_approval
          : true;
      this.deleteEntry =
        this.workflowApproval == "yes"
          ? data.directory_deleteEntry_workflow_approval
          : true;
      this.newEntryUSer =
        this.workflowApproval == "yes" && this.newEntry == true
          ? data.directory_add_entry_admin
          : userObj.user.user_id;

      this.updateUser =
        this.workflowApproval == "yes" && this.updateEntry == true
          ? data.directory_edit_entry_admin
          : userObj.user.user_id;
      this.deleteUser =
        this.workflowApproval == "yes" && this.deleteEntry == true
          ? data.directory_delete_entry_admin
          : userObj.user.user_id;
      this.sortOrderData = data.directory_sort_order;
    },

    fetch_details() {
      var data = this.$store.getters.GetUserObj;
      this.allUsers = this.orgUsers;
      this.orgUsers.forEach((element) => {
        if (element.user_status == "ACTIVE") {
          this.userList.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
      this.userList.forEach((element) => {
        if (element.user_id != data.user.user_id) {
          this.visibilityUsers.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
    },

    save_actions_data() {
      if (
        this.$store.getters.GetFormObject.directory_workflow_approval ==
          false &&
        this.workflowApproval == "yes"
      ) {
      } else {
      }
    },

    async save_mutation() {
      if (this.$refs.form1 && this.$refs.form1.validate) {
        const { valid } = await this.$refs.form1.validate();
        if (valid) {
          this.loadingbtn = true;

          var userObj = this.$store.getters.GetUserObj;

          try {
            let result = await API.graphql(
              graphqlOperation(update_directory, {
                input: {
                  directory_id: this.$store.getters.GetFormObject.directory_id,
                  directory_name: this.directroyName,
                  directory_description: this.directoryDescription,
                  is_geo_tagged: this.geoEntries == "geotagged" ? true : false,
                  directory_sort_order: this.sortOrderData,
                  filter_by:
                    this.$store.getters.GetFormObject.filter_by != undefined
                      ? this.$store.getters.GetFormObject.filter_by
                      : undefined,
                  summary_field_2:
                    this.$store.getters.GetFormObject.summary_field_2 != undefined
                      ? this.$store.getters.GetFormObject.summary_field_2
                      : undefined,
                  summary_field_1:
                    this.$store.getters.GetFormObject.summary_field_1 != undefined
                      ? this.$store.getters.GetFormObject.summary_field_1
                      : undefined,
                  directory_workflow_approval:
                    this.workflowApproval == "yes" ? true : false,
                  directory_addEntry_workflow_approval:
                    this.workflowApproval == "yes" ? this.newEntry : false,
                  directory_add_entry_admin:
                    this.workflowApproval == "yes" && this.newEntry == true
                      ? this.newEntryUSer
                      : undefined,
                  directory_editEntry_workflow_approval:
                    this.workflowApproval == "yes" ? this.updateEntry : false,
                  directory_edit_entry_admin:
                    this.workflowApproval == "yes" && this.updateEntry == true
                      ? this.updateUser
                      : undefined,
                  directory_deleteEntry_workflow_approval:
                    this.workflowApproval == "yes" ? this.deleteEntry : false,
                  directory_delete_entry_admin:
                    this.workflowApproval == "yes" && this.deleteEntry == true
                      ? this.deleteUser
                      : undefined,
                  directory_visibility_type: this.directoryVisbility,
                  directory_visibility_users:
                    this.directoryVisbility == "USERS" ? this.userDetails : [],

                  organization_id: userObj.organization.organization_id,
                  is_directory_enabled_as_form: this.entryByAllMembers,
                  is_directory_enabled_as_extrenal_form:
                    this.entryByExternalMembers,
                  external_form_name: this.externalFormName,
                },
              })
            );
            var response = JSON.parse(result.data.update_directory);
            this.loadingbtn = false;
            if (response.Status == "SUCCESS") {
              this.SnackBarComponent = {
                SnackbarVmodel: true,
                SnackbarColor: "green",
                SnackbarText: response.Message,
                timeout: 5000,
                Top: true,
              };
              this.showEditPart = 0;

              var data = this.$store.getters.GetFormObject;

              // this.fetch_audit_message();
              this.fetch_directory_details();
              if (
                this.$store.getters.GetFormObject.directory_workflow_approval ==
                  false &&
                this.workflowApproval == "yes"
              ) {
                this.republish_from_template();
              }
            } else {
              this.loadingbtn = false;
            }
          } catch (error) {
            this.loadingbtn = false;
          }
        }
      }
    },

    async republish_from_template() {
      this.loading = true;
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(custom_directory_design, {
            input: {
              directory_id: this.$store.getters.GetFormObject.directory_id,
              directory_design_template: JSON.stringify(
                this.$store.getters.GetFormObject.directory_design_template
              ),
              organization_id: data.organization.organization_id,
              user_email_id: data.user.user_email_id,
              is_directory_designed:
                this.$store.getters.GetFormObject.is_directory_designed,
              action_type: "CUSTOM",
              summary_field_2:
                this.$store.getters.GetFormObject.summary_field_2 != undefined
                  ? this.$store.getters.GetFormObject.summary_field_2
                  : undefined,
              summary_field_1:
                this.$store.getters.GetFormObject.summary_field_1 != undefined
                  ? this.$store.getters.GetFormObject.summary_field_1
                  : undefined,
              filter_by:
                this.$store.getters.GetFormObject.filter_by != undefined
                  ? this.$store.getters.GetFormObject.filter_by
                  : undefined,
            },
          })
        );
        this.loading = false;

        var response = JSON.parse(result.data.custom_directory_design);
        if (response.Status == "SUCCESS") {
        } else {
        }
      } catch (error) {}
    },
    check_user_exists(value) {
      var currentID = this.$store.getters.GetUserObj.user.user_id;
      if (!value.includes(currentID)) {
        value.push(currentID);
      }
      return value;
    },
    async fetch_audit_message() {
      var data = this.$store.getters.GetUserObj;
      var data = {
        AuditType: "DIRECTORY_ACTION",
        AuditAction: "UPDATE_DIRECTORY",
        AuditMessage: `${data.user.full_user_name} Updated   ${this.$store.getters.GetFormObject.directory_name} Directory`,
      };

      this.$store.commit("SetAuditActions", data);
    },
  },
};
</script>