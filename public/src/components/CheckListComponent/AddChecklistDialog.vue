<template>
  <div>
    <v-dialog
      :model-value="addchecklistDialog"
      @update:model-value="$emit('update:addchecklistDialog', $event)"
      fullscreen
      persistent
      transition="dialog-top-transition"
    >
      <v-card flat>
        <v-toolbar elevation="1" density="compact" class="navBar">
          <v-toolbar-title>Create Checklist Master</v-toolbar-title>
          <v-spacer />
          <v-btn
            depressed
            @click="validate_data()"
            dark
            :loading="loading"
            size="small"
            style="background-color: green; color: white"
            class="text-capitalize"
          >
            Save
          </v-btn>
          <v-btn
            depressed
            @click="close_dialog"
            dark
            size="small"
            class="ml-4 mr-2 cardCss text-capitalize"
          >
            Cancel
          </v-btn>
        </v-toolbar>

        <v-card-text class="mt-4">
          <v-form ref="form">
            <v-row>
              <!-- Left Panel -->
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="Checklistname"
                  label="Checklist Name*"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required, rules.maxLength]"
                  maxlength="50"
                  prepend-inner-icon="mdi-clipboard-text-outline"
                />
                <v-textarea
                  v-model="description"
                  label="Description"
                  variant="outlined"
                  density="compact"
                  rows="1"
                  auto-grow
                  maxlength="500"
                  prepend-inner-icon="mdi-clipboard-text-outline"
                  @input="descriptionManuallyEdited = true"
                />

                <v-row no-gutters>
                  <v-col cols="12">
                    <v-btn
                      :outlined="activeType !== 'section'"
                      :color="activeType === 'section' ? 'primary' : ''"
                      @click="setActive('section')"
                    >
                      <v-icon left>mdi-folder-plus</v-icon>
                      Add Section
                    </v-btn>

                    <v-btn
                      :outlined="activeType !== 'line_item'"
                      :color="activeType === 'line_item' ? 'primary' : ''"
                      class="ml-10"
                      @click="setActive('line_item')"
                    >
                      <v-icon left>mdi-format-line-weight</v-icon>
                      Add Line Item
                    </v-btn>
                  </v-col>
                </v-row>

                <!-- Section Form -->
                <v-card v-if="showSectionForm" outlined class="pa-4 mt-4">
                  <h3>
                    Section
                    <!-- {{
                    isEditingSection
                      ? editSectionIndex + 1
                      : sections.length + 1
                  }} -->
                  </h3>
                  <v-text-field
                    class="mt-4"
                    v-model="sectionName"
                    label="Section Name"
                    density="compact"
                    variant="outlined"
                  />
                  <v-form ref="form1">
                    <v-row>
                      <v-col cols="12" sm="5">
                        <v-text-field
                          density="compact"
                          variant="outlined"
                          :rules="[rules.required, rules.maxLength]"
                          maxlength="50"
                          v-model="itemName"
                          label="Name"
                        />
                      </v-col>
                      <v-col cols="12" sm="5">
                        <v-text-field
                          density="compact"
                          variant="outlined"
                          v-model="itemDescription"
                          label="Tooltip"
                          maxlength="500"
                          @input="itemDescriptionManuallyEdited = true"
                        />
                      </v-col>

                      <v-col cols="12" sm="2">
                        <v-btn
                          size="small"
                          color="success"
                          dark
                          @click="saveItem"
                          >{{ isEditingItem ? "Update" : "Add" }}</v-btn
                        >
                      </v-col>
                    </v-row>
                  </v-form>

                  <v-list v-if="tempItems.length" density="compact">
                    <v-list-item
                      v-for="(item, index) in tempItems"
                      :key="'temp-item-' + index"
                    >
                      <v-list-item-content>
                        <v-list-item-title class="font-weight-bold">{{
                          item.name
                        }}</v-list-item-title>
                        <v-list-item-subtitle>{{
                          item.description
                        }}</v-list-item-subtitle>
                      </v-list-item-content>
                      <v-list-item-action>
                        <v-icon small color="blue" @click="editTempItem(index)"
                          >mdi-pencil</v-icon
                        >
                        <v-icon small color="red" @click="deleteTempItem(index)"
                          >mdi-delete</v-icon
                        >
                      </v-list-item-action>
                    </v-list-item>
                  </v-list>

                  <v-card-actions class="justify-end">
                    <v-btn
                      size="small"
                      dark
                      color="primary"
                      class="mt-2"
                      @click="saveSection"
                      >{{
                        isEditingSection ? "Update Section" : "Add Section"
                      }}</v-btn
                    >
                  </v-card-actions>
                </v-card>

                <!-- Line Item Form -->
                <v-card v-if="showLineItemForm" outlined class="pa-4 mt-4">
                  <h3>
                    Line Item
                    <!-- {{
                    isEditingLineItem
                      ? editLineItemIndex + 1
                      : standaloneItems.length + 1
                  }} -->
                  </h3>
                  <v-text-field
                    v-model="lineItemName"
                    label="Name"
                    density="compact"
                    :rules="[rules.maxLength]"
                    maxlength="50"
                    variant="outlined"
                    class="mt-2"
                  />
                  <v-textarea
                    v-model="lineItemDescription"
                    label="Tooltip"
                    auto-grow
                    density="compact"
                    maxlength="500"
                    variant="outlined"
                    @input="lineItemDescriptionManuallyEdited = true"
                  />

                  <v-card-actions class="justify-end">
                    <v-btn
                      size="small"
                      dark
                      color="primary"
                      class="mt-2"
                      maxlength="500"
                      @click="saveLineItem"
                      >{{
                        isEditingLineItem ? "Update" : "Add Line Item"
                      }}</v-btn
                    >
                  </v-card-actions>
                </v-card>
              </v-col>

              <!-- Right Panel: Preview -->
              <v-col cols="12" sm="6">
                <span
                  v-if="combinedItems.length != 0"
                  style="font-size: 20px"
                  class="mb-2 d-block black--text font-weight-larger"
                  ><b>Preview Items</b></span
                >

                <div
                  ref="sortableEl"
                  class="sortable-list"
                  @dragover="allowDrop"
                  @drop="drop"
                >
                  <v-card
                    v-for="(entry, index) in combinedItems"
                    :key="'entry-' + index"
                    :class="
                      entry.type === 'section'
                        ? 'grey lighten-4'
                        : 'grey lighten-4'
                    "
                    class="mb-4 pa-3 rounded-xl"
                    :draggable="true"
                    @dragstart="dragStart(entry, index)"
                    @dragend="dragEnd(entry, index)"
                    @dragover="dragOver(index)"
                  >
                    <div class="d-flex justify-space-between align-center mb-2">
                      <div class="d-flex align-center">
                        <v-icon
                          medium
                          class="mr-2"
                          :color="
                            entry.type === 'section'
                              ? 'blue darken-1'
                              : 'green darken-1'
                          "
                        >
                          {{
                            entry.type === "section"
                              ? "mdi-folder-plus"
                              : "mdi-format-line-weight"
                          }}
                        </v-icon>

                        <span class="font-weight-bold text-body-1 mr-2">{{
                          entry.name
                        }}</span>
                        <!-- <v-chip
                        small
                        :color="
                          entry.type === 'section'
                            ? 'blue darken-1'
                            : 'grey darken-1'
                        "
                        dark
                        class="ml-1"
                      >
                        {{ entry.type === "section" ? "Section" : "Line Item" }}
                      </v-chip> -->
                      </div>
                      <div>
                        <v-icon
                          size="small"
                          @click="
                            entry.type === 'section'
                              ? editSection(index)
                              : editLineItem(index)
                          "
                        >
                          mdi-pencil
                        </v-icon>
                        <v-icon
                          size="small"
                          color="red"
                          class="ml-2"
                          @click="deleteEntry(index)"
                        >
                          mdi-delete
                        </v-icon>
                      </div>
                    </div>

                    <!-- Section Description or Line Item Tooltip -->
                    <div
                      v-if="entry.type === 'line_item'"
                      class="text-caption text--secondary"
                    >
                      {{ entry.description }}
                    </div>

                    <!-- Sub-items in Section -->
                    <v-list
                      v-if="entry.type === 'section' && entry.items.length"
                      density="compact"
                      class="mt-2"
                    >
                      <v-list-item
                        v-for="(item, i) in entry.items"
                        :key="'subitem-' + i"
                      >
                        <v-list-item-content>
                          <v-list-item-title class="font-weight-medium">
                            {{ item.name }}
                          </v-list-item-title>
                          <v-list-item-subtitle
                            class="text-caption font-weight-medium"
                          >
                            {{ item.description }}
                          </v-list-item-subtitle>
                        </v-list-item-content>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </div>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>

<script>
import { create_master_checklists } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import SnackBar from "@/components/SnackBar.vue";

export default {
  components: {
    SnackBar,
  },
  props: {
    addchecklistDialog: Boolean,
  },
  data() {
    return {
      Checklistname: "",
      description: "",
      sectionName: "",
      itemName: "",
      itemDescription: "",
      lineItemName: "",
      lineItemDescription: "",
      tempItems: [],
      showSectionForm: false,
      showLineItemForm: false,
      isEditingItem: false,
      editItemIndex: null,
      isEditingSection: false,
      editSectionIndex: null,
      isEditingLineItem: false,
      editLineItemIndex: null,
      combinedItems: [],
      sections: [],
      standaloneItems: [],
      loading: false,
      rules: {
        required: (value) => !!value || "This field is required",
        maxLength: (value) =>
          (value ? value.length <= 50 : true) ||
          "Maximum 50 characters allowed",
      },
      SnackBarComponent: {},
      activeType: null,
      descriptionManuallyEdited: false,
      itemDescriptionManuallyEdited: false,
      lineItemDescriptionManuallyEdited: false,
      draggedField: null,
      draggedIndex: null,
      dragOverIndex: null,
    };
  },
  watch: {
    Checklistname(newVal) {
      if (!this.descriptionManuallyEdited) {
        this.description = newVal;
      }
    },
    itemName(newVal) {
      if (!this.itemDescriptionManuallyEdited) {
        this.itemDescription = newVal;
      }
    },
    lineItemName(newVal) {
      if (!this.lineItemDescriptionManuallyEdited) {
        this.lineItemDescription = newVal;
      }
    },
  },
  methods: {
    setActive(type) {
      this.activeType = type;
      if (type === "section") {
        this.Add_Section();
      } else if (type === "line_item") {
        this.Add_LineItem();
      }
    },
    close_dialog() {
      this.$emit("clicked", 0);
      this.$refs.form.reset();
      this.$refs.form.resetValidation();
      this.activeType = null;
      this.showSectionForm = false;
      this.showLineItemForm = false;
      this.combinedItems = [];
    },
    Add_Section() {
      this.resetForms();
      this.showSectionForm = true;
    },
    Add_LineItem() {
      this.resetForms();
      this.showLineItemForm = true;
    },
    resetForms() {
      this.sectionName = "";
      this.itemName = "";
      this.itemDescription = "";
      this.lineItemName = "";
      this.lineItemDescription = "";
      this.tempItems = [];
      this.showSectionForm = false;
      this.showLineItemForm = false;
      this.isEditingItem = false;
      this.isEditingSection = false;
      this.isEditingLineItem = false;
      this.editItemIndex = null;
      this.editSectionIndex = null;
      this.editLineItemIndex = null;
    },
    async saveItem() {
      const { valid } = await this.$refs.form1.validate();
      if (!valid) {
        return;
      }

      const trimmedName = this.itemName.trim();

      const isDuplicate = this.tempItems.some((item, index) => {
        return (
          item.name.toLowerCase() === trimmedName.toLowerCase() &&
          index !== this.editItemIndex
        );
      });

      if (isDuplicate) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Item with the same name already exists",
          timeout: 5000,
          Top: true,
        };
        return;
      }

      const newItem = {
        name: trimmedName,
        description: this.itemDescription?.trim() || "",
      };

      if (this.isEditingItem) {
        this.tempItems.splice(this.editItemIndex, 1, newItem);
        this.isEditingItem = false;
      } else {
        this.tempItems.push(newItem);
      }

      this.itemName = "";
      this.itemDescription = "";
      this.$refs.form1.resetValidation();
    },
    editTempItem(index) {
      const item = this.tempItems[index];
      this.itemName = item.name;
      this.itemDescription = item.description;
      this.editItemIndex = index;
      this.isEditingItem = true;
    },
    deleteTempItem(index) {
      this.tempItems.splice(index, 1);
    },
    saveSection() {
      const trimmedName = this.sectionName.trim();

      if (!trimmedName) {
        this.showError("Section Name is required");
        return;
      }

      const isDuplicate = this.combinedItems.some(
        (item, index) =>
          item.type === "section" &&
          item.name.toLowerCase() === trimmedName.toLowerCase() &&
          (!this.isEditingSection || index !== this.editSectionIndex)
      );

      if (isDuplicate) {
        this.showError("A section with the same name already exists");
        return;
      }

      if (!this.tempItems.length) {
        this.showError("Add at least one item to the section");
        return;
      }

      const sectionData = {
        name: trimmedName,
        items: [...this.tempItems],
        type: "section",
        weightage: 0,
      };

      if (this.isEditingSection) {
        this.combinedItems.splice(this.editSectionIndex, 1, sectionData);
      } else {
        this.combinedItems.push(sectionData);
      }

      this.activeType = null;
      this.recalculateWeightages();
      this.resetForms();
    },

    saveLineItem() {
      const trimmedName = this.lineItemName.trim();

      if (!trimmedName) {
        this.showError("Line Item Name is required");
        return;
      }

      const isDuplicate = this.combinedItems.some(
        (item, index) =>
          item.type === "line_item" &&
          item.name.toLowerCase() === trimmedName.toLowerCase() &&
          (!this.isEditingLineItem || index !== this.editLineItemIndex)
      );

      if (isDuplicate) {
        this.showError("A line item with the same name already exists");
        return;
      }

      const itemData = {
        name: trimmedName,
        description: this.lineItemDescription,
        type: "line_item",
        items: [],
        weightage: 0,
      };

      if (this.isEditingLineItem) {
        this.combinedItems.splice(this.editLineItemIndex, 1, itemData);
      } else {
        this.combinedItems.push(itemData);
      }

      this.activeType = null;
      this.recalculateWeightages();
      this.resetForms();
    },

    showError(message) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: message,
        timeout: 5000,
        Top: true,
      };
    },

    onDragEnd() {
      this.recalculateWeightages();
    },
    allowDrop(event) {
      event.preventDefault();
    },
    dragStart(field, index) {
      this.draggedField = index;
    },
    dragEnd(field, index) {
      this.draggedField = null;

      if (this.dragOverIndex !== null) {
        // Move the field to the new position in the combinedItems array
        const item = this.combinedItems[index];
        this.combinedItems.splice(index, 1);
        this.combinedItems.splice(this.dragOverIndex, 0, item);
        this.recalculateWeightages();
      }

      this.dragOverIndex = null;
    },
    dragOver(index) {
      this.dragOverIndex = index;
    },
    drop(event) {
      event.preventDefault();
    },
    recalculateWeightages() {
      this.combinedItems.forEach((entry, index) => {
        entry.weightage = index + 1;
      });
    },
    editSection(index) {
      const section = this.combinedItems[index];
      if (!section || section.type !== "section") return;
      this.sectionName = section.name;
      this.tempItems = [...section.items];
      this.editSectionIndex = index;
      this.isEditingSection = true;
      this.showSectionForm = true;
      this.showLineItemForm = false;
    },
    editLineItem(index) {
      const item = this.combinedItems[index];
      if (!item || item.type !== "line_item") return;
      this.lineItemName = item.name;
      this.lineItemDescription = item.description;
      this.editLineItemIndex = index;
      this.isEditingLineItem = true;
      this.showLineItemForm = true;
      this.showSectionForm = false;
    },

    deleteEntry(index) {
      this.combinedItems.splice(index, 1);
      this.recalculateWeightages();
    },
    async validate_data() {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        if (this.combinedItems.length === 0) {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText:
              "Please add at least one section or line item before saving.",
            timeout: 5000,
            Top: true,
          };
          return;
        }
        await this.add_Masters();
      } else {
        // Optional: handle failed validation
        // await this.add_mutation();
      }
    },

    async add_Masters() {
      this.loading = true;

      try {
        let result = await API.graphql(
          graphqlOperation(create_master_checklists, {
            input: {
              checklist_name: this.Checklistname,
              checklist_description: this.description,
              section: JSON.stringify(this.combinedItems),
            },
          })
        );

        this.loading = false;

        var response = JSON.parse(result.data.create_master_checklists);
        this.loading = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("updaterefesh", "update");
          this.$refs.form.reset();
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loading = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>

<style scoped>
.sortable-list {
  cursor: move;
}

.v-card {
  transition: all 0.2s ease;
  cursor: grab;
}

.v-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: grabbing;
}

.sortable-ghost {
  opacity: 0.5;
  background: #c8e6c9 !important;
}

.sortable-chosen {
  background: #e8f5e8 !important;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}
</style>
