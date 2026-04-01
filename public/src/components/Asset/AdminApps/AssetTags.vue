<template>
  <div>
    <v-card flat>
      <v-form ref="form">
        <SnackBar :SnackBarComponent="SnackBarComponent" />

        <!-- <v-toolbar class="mt-4" dense flat>
          <v-text-field
            :rules="[(v) => !!v || 'required ']"
            outlined
            label="Tag Name"
            dense
            v-model="tagName"
          />
          <v-combobox
            v-model="tagSelection"
            chips
            clearable
            multiple
            dense
            outlined
            :rules="[(v) => !!v.length || 'At least one tag is required']"
            label="Types"
            hint="Press the Enter key after entering each tag"
            hide-selected
            append-icon=""
            class="ml-4"
          >
            <template v-slot:selection="{ attrs, item, select, selected }">
              <v-chip
                x-small
                v-bind="attrs"
                :input-value="selected"
                close
                @click="select"
                @click:close="removecc(item)"
              >
                <strong>{{ item }}</strong
                >&nbsp;
              </v-chip>
            </template>
          </v-combobox>
          <v-btn
            dark
            @click="validate_data()"
            class="text-capitalize cardCss ml-2 mt-n7"
          >
            Add
          </v-btn>
        </v-toolbar> -->
      </v-form>
      <v-card-text>
        <v-data-table
          :headers="tagHeaders"
          :fixed-header="fixed"
          :items="tagRecords"
          :loading="tableLoading"
          :footer-props="{
            itemsPerPageOptions: [10, 20],
          }"
          :items-per-page="20"
          density="compact"
          class="elevation-1 mt-n2 dtwidth"
        >
          <template v-slot:[`item.sub_tags`]="{ item }">
            <span>{{ item.sub_tags.join(",") }}</span>
          </template>
          <template v-slot:[`item.tag_status`]="{ item }">
            <span>{{ item.tag_status }}</span>
          </template>
          <template v-slot:[`item.actions`]="{ item }">
            <v-icon small @click="edit_dialog(item)" dense color="primaryColor"
              >mdi-pencil</v-icon
            >
            <v-icon small @click="delete_dialog(item)" dense color="red"
              >mdi-delete</v-icon
            >
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
    <div v-if="componentCheck == 1">
      <EditAssetTags
        :rowInfo="rowInfo"
        :editTagDialog="editTagDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="editTagDialog = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <AssetsTagsDelete
        :rowInfo="rowInfo"
        :deletetagDialog="deletetagDialog"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="deletetagDialog = false"
      />
    </div>
  </div>
</template>
<script>
/*eslint-disable*/
import { create_list_delete_tags } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";

import SnackBar from "@/components/SnackBar.vue";
import EditAssetTags from "@/components/Asset/Popups/EditAssetTags.vue";
import AssetsTagsDelete from "@/components/Asset/Popups/AssetsTagsDelete.vue";

export default {
  components: {
    SnackBar,
    EditAssetTags,
    AssetsTagsDelete,
  },
  data() {
    return {
      tagSelection: [],
      tagName: "",
      tableLoading: false,
      tagHeaders: [
        {
          title: "Name",
          key: "tag_name",
          sortable: false,
        },

        { title: "Value", key: "sub_tags", sortable: false },
        { title: "Status", key: "tag_status", sortable: false },
        { title: "Actions", key: "actions", sortable: false },
      ],
      fixed: false,
      tagRecords: [],
      SnackBarComponent: {},
      editTagDialog: false,
      rowInfo: {},
      componentCheck: 0,
      deletetagDialog: false,
    };
  },
  created() {
    this.create_asset_tags("LIST_TAGS");
  },
  methods: {
    fetch_data(value) {
      var data = value;

      // return data.join(",")
      //   console.log(value);
    },

    edit_dialog(value) {
      this.componentCheck = 1;
      this.editTagDialog = true;
      this.rowInfo = value;
    },

    delete_dialog(value) {
      this.rowInfo = value;
      this.componentCheck = 2;
      this.deletetagDialog = true;
    },

    success_info(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green", // Change color to indicate an error
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.deletetagDialog = false;
      this.editTagDialog = false;
      this.create_asset_tags("LIST_TAGS");
    },

    error_info(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red", // Change color to indicate an error
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
    },

    validate_data() {
      const isFormValid = this.$refs.form.validate();
      const hasExceededMaxTags = this.tagRecords.length > 4;
      //   if (this.$refs.form.validate()) {
      //     this.create_asset_tags("CREATE_TAGS");
      //   }
      if (isFormValid && !hasExceededMaxTags) {
        this.create_asset_tags("CREATE_TAGS");
      } else if (isFormValid && hasExceededMaxTags) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red", // Change color to indicate an error
          SnackbarText: "Maximum five tags can be added",
          timeout: 5000,
          Top: true,
        };
      }
    },

    async create_asset_tags(value) {
      this.tableLoading = true;
      var data = this.$store.getters.GetUserObj;
      //   console.log(this.tagSelection);
      try {
        let result = await API.graphql(
          graphqlOperation(create_list_delete_tags, {
            input: {
              user_email_id: data.user.user_email_id,
              action_type: value,
              tag_name: value == "LIST_TAGS" ? undefined : this.tagName,
              sub_tags:
                value == "LIST_TAGS"
                  ? undefined
                  : JSON.stringify(this.tagSelection),
            },
          })
        );
        var response = JSON.parse(result.data.create_list_delete_tags);

        this.tagRecords = [];
        this.tableLoading = false;
        if (response.Status == "SUCCESS") {
          if (value == "CREATE_TAGS") {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: response.Message,
              timeout: 5000,
              Top: true,
            };
            this.$refs.form.reset();
            this.create_asset_tags("LIST_TAGS");
          } else {
            this.tagRecords = response.data;
            this.tableLoading = false;
          }
        } else {
          this.tagRecords = [];
          this.tableLoading = false;
        }
      } catch (error) {
        this.tagRecords = [];
        this.tableLoading = false;
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    removecc(item) {
      this.tagSelection.splice(this.tagSelection.indexOf(item), 1);
    },
  },
};
</script>