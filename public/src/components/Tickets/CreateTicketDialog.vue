<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog :model-value="DialogCreateTicket" max-width="680px" persistent>
      <v-card rounded="lg">
        <!--Card Title-->
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4"
        >
          <span class="font-weight-bold text-h5">Create Ticket</span>
          <v-btn
            icon
            variant="text"
            @click="DialogCreateTicketEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-divider></v-divider>

        <!--Form Fields-->
        <div style="max-height: 500px; overflow-y: auto">
          <v-form ref="form">
            <v-row no-gutters class="pa-7">
              <!--Ticket Title-->
              <v-col cols="12">
                <div class="font-weight-bold ml-2 mt-n4">
                  Ticket Title <span class="text-error">*</span>
                </div>
                <v-text-field
                  v-model="ticket_title"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  class="mt-1 ml-n1 pa-1"
                  :counter="100"
                  :rules="[
                    (v) => !!v || 'Required',
                    (v) =>
                      (v && v.length <= 100) ||
                      'Title must be 100 characters or less',
                  ]"
                />
              </v-col>

              <!--Ticket Category-->
              <v-col cols="6">
                <div class="font-weight-bold">
                  Ticket Category <span class="text-error">*</span>
                </div>
                <v-select
                  v-model="category"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  class="mt-1 ml-n1 pa-1"
                  :rules="[(v) => !!v || 'Ticket type is required']"
                  :items="ticketCategoriesList"
                  item-title="title"
                  item-value="value"
                />
              </v-col>

              <!--Ticket Subcategory-->
              <v-col cols="6">
                <div class="font-weight-bold">Ticket Subcategory</div>
                <v-select
                  v-model="subcategory"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  class="mt-1 pa-1"
                  :items="ticketTypeList"
                  :disabled="!category"
                  item-title="title"
                  item-value="value"
                />
              </v-col>

              <!--Ticket Description-->
              <v-col cols="12">
                <div class="font-weight-bold ml-2 mt-n1">
                  Ticket Description
                </div>
                <v-textarea
                  v-model="ticket_description"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  class="mt-1 ml-n1 pa-1"
                  maxlength="200"
                  :counter="200"
                  :rules="[
                    (v) => !!v || 'Required',
                    (v) =>
                      (v && v.length <= 200) ||
                      'Title must be 200 characters or less',
                  ]"
                />
              </v-col>

              <!--Assign Agents-->
              <v-col
                v-if="
                  selectedCategory?.ticket_distribution === 'MODERATOR' &&
                  selectedCategory.moderator_email === currentUserEmail
                "
                cols="12"
              >
                <div class="font-weight-bold">Assign</div>
                <v-select
                  v-model="agent"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  class="mt-1 pa-1"
                  :items="assignAgents"
                />
              </v-col>

              <!--Attachments-->
              <v-col cols="6">
                <div class="font-weight-bold mt-n2">Attachments</div>
                <v-file-input
                  accept="image/png, image/jpeg"
                  variant="outlined"
                  rounded="lg"
                  density="compact"
                  class="mt-2"
                  @change="onFileSelected"
                />
              </v-col>

              <!--Image Preview-->
              <v-col cols="12">
                <v-img
                  v-if="imagePreview"
                  :src="imagePreview"
                  height="230"
                  rounded="lg"
                  class="mt-n3"
                />
              </v-col>
            </v-row>
          </v-form>
        </div>

        <!--Button-->
        <v-card-actions class="d-flex justify-end mt-n10">
          <v-btn
            rounded="lg"
            color="primary"
            class="mb-1 mr-1"
            @click="ValidateForm"
            :loading="loading"
          >
            Create
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { get_current_details } from "@/mixins/GetCuurentUser";
import { GetAllListCategories } from "@/mixins/GetAllListCategories";
import { GetAllListTicketTypes } from "@/mixins/GetAllListTicketTypes";
import { uploadToS3 } from "@/mixins/TicketsS3Upload.js";
import { create_ticket } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: {
    DialogCreateTicket: Boolean,
    orgDetails: Object,
    screenshotFile: File,
  },

  mixins: [get_current_details, GetAllListTicketTypes, GetAllListCategories],

  components: { SnackBar },

  data: () => ({
    ticket_title: "",
    category: "",
    subcategory: "",
    ticket_description: "",
    agent: "",

    selectedFile: null,
    imagePreview: null,
    imageUrl: null,

    loading: false,
    userEditedDescription: false,

    SnackBarComponent: {},
  }),

  watch: {
    DialogCreateTicket(val) {
      if (val) {
        this.fetchCreateTicketApi();
        if (this.screenshotFile) {
          this.onFileSelected(this.screenshotFile);
        }
      } else {
        this.$refs.form.reset();
        this.imagePreview = null;
        this.selectedFile = null;
        this.imageUrl = null;
      }
    },
    category(newVal) {
      if (newVal) {
        this.GetAllListTicketTypesMethod(newVal);
      }
    },
    ticket_title(newVal) {
      if (!this.userEditedDescription) {
        this.ticket_description = newVal;
      }
    },
    ticket_title(val) {
      if (val && val.length > 100) {
        this.ticket_title = val.slice(0, 100);
      }
    },
    ticket_description(val) {
      if (val && val.length > 200) {
        this.ticket_description = val.slice(0, 200);
      }
    },
    subcategory() {
      this.agent = "";
    },
  },

  computed: {
    ticketCategoriesList() {
      return this.ListAllCategories.map((ticket) => ({
        title: ticket.category_name,
        value: ticket.category_id,
      }));
    },
    ticketTypeList() {
      return this.ListAllTicketTypes.map((ticket) => ({
        title: ticket.ticket_type_name,
        value: ticket.ticket_type_id,
      }));
    },
    assignAgents() {
      if (
        this.selectedSubcategory &&
        this.selectedSubcategory.auto_assign_group
      ) {
        return this.selectedSubcategory.auto_assign_group
          .filter((email) => email !== this.currentUserEmail)
          .map((email) => ({ title: email, value: email }));
      }
      const selectedCategory = this.selectedCategory;
      if (selectedCategory?.auto_assign_group) {
        return selectedCategory.auto_assign_group
          .filter((email) => email !== this.currentUserEmail)
          .map((email) => ({ title: email, value: email }));
      }

      return [];
    },
    selectedCategory() {
      return this.ListAllCategories.find(
        (c) => c.category_id === this.category
      );
    },
    selectedSubcategory() {
      return this.ListAllTicketTypes.find(
        (t) => t.ticket_type_id === this.subcategory
      );
    },
    currentUserEmail() {
      return this.$store.getters.GetUserEmail;
    },
  },

  methods: {
    async ValidateForm() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        this.CreateTicket();
      }
    },
    async uploadImage() {
      if (!this.selectedFile) return;
      try {
        const key = `tickets/${crypto.randomUUID()}_${this.selectedFile.name}`;
        this.imageUrl = await uploadToS3(
          this.selectedFile,
          this.orgDetails,
          key
        );
      } catch (err) {
        this.imageUrl = null;
      }
    },
    async CreateTicket() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_ticket, {
            input: {
              title: this.ticket_title,
              category_id: this.category,
              ticket_type_id: this.subcategory,
              attachments: this.imageUrl,
              description: this.ticket_description,
              assigned_to_email: this.agent,
            },
          })
        );
        let resultObj = JSON.parse(result.data.create_ticket);
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ " + resultObj.Message,
          };
          this.DialogCreateTicketEmit(2);
          this.$refs.form.reset();
          this.imagePreview = null;
          this.selectedFile = null;
          this.imageUrl = null;
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "❎ " + resultObj.Message,
          };
        }
      } catch (err) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to create Ticket, try again!",
        };
      } finally {
        this.loading = false;
      }
    },
    async fetchCreateTicketApi() {
      await this.GetAllListCategoriesMethod();
      await this.get_current_details();
    },
    onFileSelected(input) {
      let file = null;

      if (Array.isArray(input)) {
        file = input[0];
      } else if (input instanceof File) {
        file = input;
      } else if (input?.target?.files?.length) {
        file = input.target.files[0];
      }
      if (!file) {
        this.selectedFile = null;
        this.imagePreview = null;
        this.imageUrl = null;
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = (e) => (this.imagePreview = e.target.result);
      reader.readAsDataURL(file);

      this.uploadImage();
    },
    DialogCreateTicketEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
  },
};
</script>
