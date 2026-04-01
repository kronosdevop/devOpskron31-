<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog
      :model-value="editformFields"
      @update:model-value="$emit('update:editformFields', $event)"
      persistent
      max-width="700"
      transition="dialog-top-transition"
    >
      <v-card>
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="text--black"
            ><div class="custom-title">
              Edit Field Properties for <b> {{ stepName }} </b>
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-data-table
            density="compact"
            :headers="headers"
            :items="tableData"
            :items-per-page="15"
            class="mt-2 dense-table"
          >
            <template #[`item.visible`]="{ item }">
              <v-checkbox
                v-model="item.visible"
                density="compact"
                size="x-small"
                hide-details
                class=""
                @update:model-value="get_value($event, 'visible', item)"
              ></v-checkbox>
            </template>
            <template #[`item.editable`]="{ item }">
              <v-checkbox
                :disabled="item.visible == false"
                density="compact"
                size="x-small"
                hide-details
                v-model="item.editable"
                @update:model-value="get_value($event, 'editable', item)"
              >
              </v-checkbox>
            </template>
            <template #[`item.mandatory`]="{ item }">
              <v-checkbox
                density="compact"
                size="x-small"
                hide-details
                :disabled="item.visible == false || item.editable == false"
                v-model="item.mandatory"
                @update:model-value="get_value($event, 'mandatory', item)"
              ></v-checkbox>
            </template>
          </v-data-table>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn
            small
            class="text-capitalize ml-1 cardCss text-white"
            @click="save_changes()"
            dark
            >Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
/* eslint-disable */
export default {
  props: {
    editformFields: Boolean,
    fieldsData: Array,
    stepName: String,
    stepIndex: Number,
  },
  data() {
    return {
      headers: [
        {
          title: "Form Field",
          align: "start",
          sortable: false,
          key: "label",
        },
        {
          title: "Visible",
          align: "start",
          sortable: false,
          key: "visible",
        },
        {
          title: "Editable",
          align: "start",
          sortable: false,
          key: "editable",
        },
        {
          title: "Mandatory",
          align: "start",
          sortable: false,
          key: "mandatory",
        },
      ],
      tableData: [],
      updatedData: [],
    };
  },
  watch: {
    editformFields: {
      async handler() {
        if (this.editformFields == true) {
          this.tableData = [];
          //   this.tableData = this.fieldsData;
          this.fetch_data(this.fieldsData);
        }
      },
      immediate: true,
    },
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
    fetch_data(value) {
      var array2 = [];
      array2 = value;
      this.tableData = [];
      array2.forEach((element) => {
        this.tableData.push({
          label: element.display_label,
          data_type: element.data_type,
          display_weightage: element.display_weightage,
          input_array_value: element.input_array_value,
          input_value: element.input_value,
          visible: element.is_displayed,
          editable: element.is_editable,
          mandatory: element.is_required,
          key: element.key,
          section: element.section,
          value: element.value,
          value_label: element.value_label,
        });
      });
      this.updatedData = array2;
    },

    get_value(value, name, item) {
      var array2 = this.tableData;

      array2.forEach((element) => {
        if (element.label == item.label) {
          // Update the property that was changed
          if (name == "visible") {
            element.visible = value;
            // If visible is set to false, automatically set editable and mandatory to false
            if (value == false) {
              element.editable = false;
              element.mandatory = false;
              item.editable = false;
              item.mandatory = false;
            }
          } else if (name == "editable") {
            element.editable = value;
            // If editable is set to false, automatically set mandatory to false
            if (value == false) {
              element.mandatory = false;
              item.mandatory = false;
            }
          } else if (name == "mandatory") {
            element.mandatory = value;
          }
        }
      });
      this.updatedData = array2;
    },

    save_changes() {
      this.$emit(
        "updatedVisibility",
        this.tableData,
        this.stepName,
        this.stepIndex
      );
    },
  },
};
</script>

<style scoped>
.dense-table {
  --v-data-table-row-height: 32px !important;
}

.dense-table :deep(.v-data-table__tr) {
  height: 32px !important;
}

.dense-table :deep(.v-data-table__td) {
  padding: 4px 8px !important;
  height: 32px !important;
}

.dense-table :deep(.v-data-table__th) {
  padding: 8px !important;
  height: 40px !important;
}

.dense-table :deep(.v-checkbox) {
  margin: 0 !important;
  padding: 0 !important;
}

.dense-table :deep(.v-checkbox .v-selection-control) {
  min-height: 24px !important;
}

.dense-table :deep(.v-checkbox .v-selection-control__wrapper) {
  padding: 0 !important;
}
</style>