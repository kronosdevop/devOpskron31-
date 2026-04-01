<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-dialog
      :model-value="DialogDeleteSubcategory"
      max-width="400px"
      persistent
    >
      <v-card rounded="lg">
        <v-card-title
          class="d-flex align-center justify-space-between px-6 py-4 sticky-title"
        >
          <span class="font-weight-bold text-h5">Delete Subcategory</span>
          <v-btn
            icon
            variant="text"
            @click="DialogDeleteSubcategoryEmit(1)"
            size="small"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>

        <div class="d-flex justify-center mt-3">
          Do you want to delete {{ StoreObj.ticket_type_name }}?
        </div>

        <v-card-actions class="d-flex justify-end">
          <v-btn
            rounded="lg"
            color="primary"
            :loading="loading"
            @click="DeleteSubcategory"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { create_list_edit_delete_ticket_type } from "@/graphql/mutations";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "../SnackBar.vue";

export default {
  props: { DialogDeleteSubcategory: Boolean, StoreObj: Object },

  components: { SnackBar },

  data: () => ({
    loading: false,

    SnackBarComponent: {},
  }),

  methods: {
    DialogDeleteSubcategoryEmit(Toggle) {
      this.$emit("clicked", Toggle);
    },
    async DeleteSubcategory() {
      this.loading = true;
      try {
        const result = await API.graphql(
          graphqlOperation(create_list_edit_delete_ticket_type, {
            input: {
              action_type: "DELETE",
              ticket_type_id: this.StoreObj.ticket_type_id,
            },
          })
        );
        let resultObj = JSON.parse(
          result.data.create_list_edit_delete_ticket_type
        );
        if (resultObj.Status === "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: "☑️ " + resultObj.Message,
          };
          this.$emit("refresh-list");
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "❎ " + resultObj.Message,
          };
        }
        this.DialogDeleteSubcategoryEmit(2);
        this.loading = false;
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "❎ Failed to delete subcategory, try again.",
        };
      }
      this.loading = false;
    },
  },
};
</script>
