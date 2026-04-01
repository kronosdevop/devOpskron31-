<template>
  <div>
    <v-card flat class="mt-4">
      <SnackBar :SnackBarComponent="SnackBarComponent" />
      <v-row no-gutters>
        <!-- <v-col cols="4">
          <v-toolbar dense>
            <v-toolbar-title style="font-size: 14px"
              >Last Published Message
            </v-toolbar-title>
          </v-toolbar>
          <PublishedMessage :key="componentrefresh" />
        </v-col>
        <v-divider /> -->
        <v-col cols="12">
          <v-form ref="form1">
            <v-toolbar class="ml-2" dense>
              <v-select
                dense
                outlined
                v-model="sectionType"
                :rules="[(v) => !!v || 'Required']"
                style="max-width: 250px"
                class="mt-6 ml-2"
                label="Select Type"
                :items="['Text', 'Tabular', 'Chart']"
              />
              <v-select
                dense
                outlined
                v-show="sectionType == 'Chart'"
                v-model="sectionchartsTypes"
                :rules="
                  sectionType == 'Chart' ? [(v) => !!v || 'Required'] : []
                "
                style="max-width: 250px"
                class="mt-6 ml-2"
                label="Sub Type"
                :items="[
                  { label: 'Line Chart', value: 'Line Chart' },
                  { label: 'Horizontal Chart', value: 'Bar Chart' },
                  { label: 'Vertical Chart', value: 'Column Chart' },
                  { label: 'Pie Chart', value: 'Pie Chart' },
                  { label: 'Donut Chart', value: 'Donut Chart' },
                ]"
                item-text="label"
                item-value="value"
              />
              <v-select
                dense
                outlined
                v-show="sectionType == 'Tabular'"
                v-model="sectiontabulatType"
                :rules="
                  sectionType == 'Tabular' ? [(v) => !!v || 'Required'] : []
                "
                style="max-width: 250px"
                class="mt-6 ml-2"
                label="Sub Type"
                :items="[
                  { text: '1 Column', value: 1 },
                  { text: '2 Column', value: 2 },
                  { text: '3 Column', value: 3 },
                ]"
                item-text="text"
                item-value="value"
              />
              <v-text-field
                dense
                class="ml-2 mt-6"
                outlined
                :rules="[(v) => !!v || 'Required']"
                style="max-width: 250px"
                label="Section Title"
                v-model="sectionTitle"
              />

              <v-btn
                small
                depressed
                @click="validate_data"
                dark
                class="cardCss button-corner ml-4 mt-7 text-capitalize"
              >
                Add
              </v-btn>
              <v-spacer />
              <!-- <v-btn
                small
                depressed
                v-show="sectionArray.length > 0"
                :loading="loading2"
                @click="save_as_draft()"
                dark
                class="cardCss button-corner mt-6 text-capitalize"
              >
                Save as Draft
              </v-btn> -->
              <v-btn
                small
                depressed
                v-show="sectionArray.length > 0"
                :loading="loading"
                @click="publish_data"
                dark
                class="cardCss button-corner ml-4 mt-6 text-capitalize"
              >
                Preview and Publish
              </v-btn>
            </v-toolbar>
          </v-form>
          <v-card-text>
            <v-row no-gutters>
              <v-col cols="8">
                <v-expansion-panels v-model="activePanel">
                  <v-expansion-panel
                    class="mt-1"
                    v-for="(item, i) in sectionArray"
                    :key="i"
                    v-model="openedPanels"
                  >
                    <v-expansion-panel-header
                      :class="[
                        getHeaderClass(i) == true
                          ? 'mininavbar'
                          : 'primaryColor',
                        'fixed-header-height',
                      ]"
                    >
                      <div style="display: flex; align-items: center">
                        <span class="white--text">{{
                          item.sectionTitle + " " + "(" + item.sectionType + ")"
                        }}</span>
                        <v-spacer />
                        <v-icon
                          dense
                          style=""
                          color="white"
                          @click.stop="deleteSection(i)"
                          >mdi-delete</v-icon
                        >
                      </div>
                      <template #actions>
                        <v-icon color="white"> mdi-chevron-down </v-icon>
                      </template>
                    </v-expansion-panel-header>

                    <v-expansion-panel-content class="mt-3">
                      <div class="chart-container">
                        <div v-if="item.secType === 'Text'">
                          <!-- TODO: Replace with Vue 3 compatible rich text editor (e.g., @tinymce/tinymce-vue, quill) -->
                        </div>

                        <div v-show="item.secType === 'Tabular'">
                          <v-row no-gutters>
                            <v-col
                              v-for="(column, index) in item.columnNames"
                              :key="'column-' + index"
                              cols="12"
                              sm="4"
                            >
                              <v-text-field
                                class="ma-1"
                                v-model="item.columnNames[index]"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                          <v-row no-gutters>
                            <v-col
                              v-for="(row, rowIndex) in item.rows"
                              :key="'row-' + rowIndex"
                              cols="12"
                            >
                              <v-row no-gutters>
                                <v-col
                                  v-for="(column, colIndex) in item.columnNames"
                                  :key="'cell-' + rowIndex + '-' + colIndex"
                                  cols="12"
                                  sm="4"
                                >
                                  <v-textarea
                                    rows="0"
                                    class="ma-1"
                                    v-model="item.rows[rowIndex][column]"
                                    :label="'Value for ' + column"
                                    dense
                                  ></v-textarea>
                                </v-col>

                                <v-btn icon color="error" class="mt-2">
                                  <v-icon @click="remove_row(i, rowIndex)"
                                    >mdi-delete</v-icon
                                  >
                                </v-btn>
                              </v-row>
                            </v-col>
                          </v-row>

                          <v-btn
                            @click="add_row(i)"
                            color="primary"
                            class="mt-2"
                          >
                            <v-icon left>mdi-plus</v-icon> Add Row
                          </v-btn>
                        </div>

                        <div
                          v-show="
                            item.chartSection === 'Pie Chart' ||
                            item.chartSection === 'Donut Chart'
                          "
                        >
                          <v-row class="mt-2" no-gutters>
                            <v-col
                              v-for="(pair, rowIndex) in item.keyValuePairs"
                              :key="'pair-row-' + rowIndex"
                              cols="12"
                            >
                              <v-row no-gutters>
                                <!-- Key Field -->
                                <v-col cols="5">
                                  <v-text-field
                                    v-model="pair.key"
                                    :label="'Label ' + (rowIndex + 1)"
                                    dense
                                    class="ma-1"
                                    hide-details
                                  ></v-text-field>
                                </v-col>
                                <!-- Value Field -->
                                <v-col cols="5">
                                  <v-text-field
                                    v-model="pair.value"
                                    :label="'Value for ' + pair.key"
                                    dense
                                    class="ma-1"
                                    hide-details
                                    @keypress="is_number($event)"
                                    v-on:paste="process($event)"
                                  ></v-text-field>
                                </v-col>
                                <!-- Add Key-Value Pair Button -->
                                <v-col cols="1">
                                  <v-btn
                                    @click="addKeyValuePair(i)"
                                    icon
                                    color="primary"
                                    class="mt-2"
                                  >
                                    <v-icon>mdi-plus</v-icon>
                                  </v-btn>
                                </v-col>
                                <!-- Delete Key-Value Pair Button (except for the first row) -->
                                <v-col cols="1">
                                  <v-btn
                                    v-if="rowIndex > 0"
                                    @click="removeKeyValuePair(i, rowIndex)"
                                    icon
                                    color="error"
                                    class="mt-2"
                                  >
                                    <v-icon>mdi-delete</v-icon>
                                  </v-btn>
                                </v-col>
                              </v-row>
                            </v-col>
                          </v-row>
                        </div>
                        <div
                          v-show="
                            item.chartSection === 'Line Chart' ||
                            item.chartSection === 'Bar Chart' ||
                            item.chartSection === 'Column Chart'
                          "
                        >
                          <v-row class="mt-2" no-gutters>
                            <v-col
                              v-for="(
                                series, seriesIndex
                              ) in item.section_value"
                              :key="'series-' + seriesIndex"
                              cols="12"
                            >
                              <v-row no-gutters>
                                <v-textarea
                                  v-model="series.label"
                                  :label="getLabel('label', seriesIndex, item)"
                                  dense
                                  auto-grow
                                  class="ma-1"
                                  rows="0"
                                  hide-details
                                ></v-textarea>
                                <!-- :label="'Label ' + (seriesIndex + 1)"
                            :label="getLabel('label', seriesIndex)" -->
                                <v-textarea
                                  v-model="series.x"
                                  :label="getLabel('x', seriesIndex, item)"
                                  dense
                                  auto-grow
                                  class="ma-1"
                                  rows="0"
                                  :readonly="seriesIndex !== 0"
                                  hint="Enter values separated by commas"
                                  @blur="
                                    updateXValues(i, seriesIndex, series.x)
                                  "
                                ></v-textarea>
                                <!-- :label="'X Values for ' + series.label" -->
                                <!-- @blur="updateXValues(seriesIndex, series.x)" -->
                                <v-textarea
                                  v-model="series.y"
                                  :label="'Y Values for ' + series.label"
                                  dense
                                  auto-grow
                                  class="ma-1"
                                  rows="0"
                                  hint="Enter values separated by commas"
                                  @keypress="is_numberline($event)"
                                  v-on:paste="processline($event)"
                                ></v-textarea>

                                <v-icon
                                  class="mt-2"
                                  color="primary"
                                  v-if="
                                    seriesIndex ===
                                    item.section_value.length - 1
                                  "
                                  @click="addSeries(i)"
                                  >mdi-plus</v-icon
                                >

                                <v-icon
                                  class="mt-2"
                                  color="red"
                                  v-if="seriesIndex > 0"
                                  @click="removeSeries(i, seriesIndex)"
                                  >mdi-delete</v-icon
                                >
                              </v-row>
                            </v-col>
                          </v-row>
                        </div>
                      </div>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-col>
            </v-row>
          </v-card-text>
        </v-col>
      </v-row>
      <div v-if="componentCheck == 1">
        <PreviewDialog
          :finalPublishData="finalPublishData"
          :previewPopup="previewPopup"
          v-on:erroMsg="error_info"
          v-on:successMsg="success_info"
          :summaryField="summaryField"
          @clicked="previewPopup = false"
          :apptype="apptype"
        />
      </div>
    </v-card>
  </div>
</template>

<script>
/*eslint-disable*/
import SnackBar from "@/components/SnackBar.vue";
import PublishedMessage from "@/components/DashBoard/PublishedMessage.vue";
import PreviewDialog from "@/components/DashBoard/Popups/PreviewDialog.vue";
import { dashboard_sections } from "@/graphql/mutations.js";
import { API, graphqlOperation } from "aws-amplify";
import { Buffer } from "buffer";
// import { VueEditor } from "vue2-editor";
var axios = require("axios");

export default {
  components: {
    PreviewDialog,
    SnackBar,
    PublishedMessage,
    // VueEditor,
  },
  data() {
    return {
      sectionType: "",
      sectionTitle: "",
      apptype: "TVBoard",
      sectionArray: [],
      editors: [], // Store editor instances here
      openedPanels: [],
      sectiontabulatType: "",
      sectionchartsTypes: "",
      loading: false,
      componentCheck: 0,
      finalPublishData: [],
      previewPopup: false,
      SnackBarComponent: {},
      customToolbar: [
        [{ header: [false, 1, 2, 3, 4, 5, 6] }],
        ["bold", "italic", "underline"],
        [{ align: "" }, { align: "center" }, { align: "justify" }],
        [{ color: [] }],
      ],
      componentrefresh: 0,
      loading2: false,
      activePanel: null,
      queryErrorCheck: false,
      summaryField: "",
      // Track the state of panels
    };
  },
  created() {
    this.componentrefresh += 1;
    this.queryErrorCheck = false;
    // this.get_dashboard("LIST");
  },
  methods: {
    getHeaderClass(panelIndex) {
      return this.activePanel === panelIndex ? false : true;
    },

    getLabel(type, index, item) {
      const chartType = item.chartSection;
      switch (chartType) {
        case "Bar Chart":
          return type === "label"
            ? `Horizontal bar ${index + 1} label `
            : type === "x"
            ? `Horizontal bar X values for ${item.section_value[index].label}`
            : `Horizontal bar Y values for ${item.section_value[index].label}`;
        case "Line Chart":
          return type === "label"
            ? `Line ${index + 1} label `
            : type === "x"
            ? `Line X values for ${item.section_value[index].label}`
            : `Line Y values for ${item.section_value[index].label}`;
        case "Column Chart":
          return type === "label"
            ? `Vertical bar  ${index + 1} label`
            : type === "x"
            ? `Vertical bar X values for ${item.section_value[index].label}`
            : `Vertical bar Y values for ${item.section_value[index].label}`;
        default:
          return "";
      }
    },

    save_as_draft() {
      this.loading2 = true;
      // this.queryErrorCheck = 0;
      this.get_dashboard("EDIT");
    },

    is_numberline(evt) {
      evt = evt || window.event;
      var charCode = evt.which || evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 44 &&
        charCode !== 46 &&
        charCode !== 8
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },

    processline(event) {
      if (event.type === "paste") {
        var clipboardData = event.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData("Text");

        // Check if pasted data contains anything other than numbers, commas, or dots
        if (/[^0-9,.]/.test(pastedData)) {
          event.preventDefault();
        } else {
          return;
        }
      }

      var keyCode = event.keyCode || event.which;
      if (keyCode >= 96 && keyCode <= 105) {
        keyCode -= 48;
      }

      var charValue = String.fromCharCode(keyCode);
      if (/[^0-9,.]/.test(charValue) && event.keyCode !== 8) {
        event.preventDefault();
      }
    },

    success_info(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
      this.previewPopup = false;
      this.sectionArray = [];
      this.openedPanels = [];
      this.componentrefresh += 1;
      this.sectionArray = [];
      // this.get_dashboard("LIST");
    },

    error_info(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: value,
        timeout: 5000,
        Top: true,
      };
    },

    applyFormatting(command, index) {
      // Apply the formatting command to the contenteditable div for the specified panel
      const editor = this.$refs[`editor-${index}`][0];
      document.execCommand(command, false, null);
      this.updateContent(index); // Update content after formatting
    },

    updateContent(index) {
      // Update the section data with the content from the contenteditable div
      this.sectionArray[index].body =
        this.$refs[`editor-${index}`][0].innerHTML;
    },

    updateXValues(sectionIndex, seriesIndex, newValue) {
      if (sectionIndex >= 0 && sectionIndex < this.sectionArray.length) {
        const section = this.sectionArray[sectionIndex];

        if (
          section.section_value &&
          seriesIndex >= 0 &&
          seriesIndex < section.section_value.length
        ) {
          const newXValues = newValue.split(",").map((value) => value.trim());

          if (seriesIndex === 0) {
            section.section_value.forEach((series) => {
              series.x = [...newXValues];
            });
          } else {
            section.section_value[seriesIndex].x = [...newXValues];
          }

          // console.log("Updated section data:", section);
        } else {
          console.error("Invalid series index or section value.");
        }
      } else {
        // console.error("Invalid section index.");
      }
    },

    deleteSection(index) {
      this.sectionArray.splice(index, 1);

      // this.openedPanels = this.openedPanels.filter(panelIndex => panelIndex !== index);
    },

    handlePanelChange(index) {},

    validate_data() {
      if (this.$refs.form1.validate()) {
        this.addSection();
      }
    },
    async addSection() {
      const newSection = {
        sectionTitle: this.sectionTitle,
        sectionType:
          this.sectionType == "Chart"
            ? this.sectionchartsTypes
            : this.sectionType,
        secType:
          this.sectionType == "Chart"
            ? this.sectionchartsTypes
            : this.sectionType,

        columnNames:
          this.sectionType === "Tabular"
            ? this.create_colum_names(this.sectiontabulatType)
            : [],
        rows: [],
        chartSection: this.sectionchartsTypes,
        labels: ["Label 1"], // Default labels
        values: [{}],
        keyValuePairs: [{ key: "", value: "" }],
        xValues: [],
        body: "",
        section_value: [
          {
            label: "",
            x: [],
            y: [],
          },
        ],
      };

      this.sectionArray.push(newSection);
      this.openedPanels.push(this.sectionArray.length - 1);

      this.sectionTitle = "";
      this.sectionType = "";
      this.sectiontabulatType = "";
      this.sectionchartsTypes = "";
      this.$refs.form1.reset();
    },

    is_number(evt) {
      evt = evt ? evt : window.event;
      var charCode = evt.which ? evt.which : evt.keyCode;
      if (
        charCode > 31 &&
        (charCode < 48 || charCode > 57) &&
        charCode !== 46
      ) {
        evt.preventDefault();
      } else {
        return true;
      }
    },

    process(event) {
      if (event.type == "paste") {
        var clipboardData = event.clipboardData || window.clipboardData;
        var pastedData = clipboardData.getData("Text");
        if (isNaN(pastedData)) {
          event.preventDefault();
        } else {
          return;
        }
      }
      var keyCode = event.keyCode || event.which;
      if (keyCode >= 96 && keyCode <= 105) {
        keyCode -= 48;
      }
      var charValue = String.fromCharCode(keyCode);
      if (isNaN(parseInt(charValue)) && event.keyCode != 8) {
        event.preventDefault();
      }
    },

    addKeyValuePair(sectionIndex) {
      var data = this.sectionArray[sectionIndex].keyValuePairs;
      if (data.length > 0) {
        const lastItem = data[data.length - 1];

        if (lastItem.key === "" || lastItem.value === "") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "Enter label and value",
            timeout: 5000,
            Top: true,
          };
        } else {
          if (this.sectionArray[sectionIndex]) {
            this.sectionArray[sectionIndex].keyValuePairs.push({
              key: "",
              value: "",
            });
          }
        }
      } else {
        // console.log("Array is empty. Nothing to check.");
      }
      // if (this.sectionArray[sectionIndex]) {
      //   this.sectionArray[sectionIndex].keyValuePairs.push({
      //     key: "",
      //     value: "",
      //   });
      // }
    },

    removeKeyValuePair(sectionIndex, pairIndex) {
      if (
        this.sectionArray[sectionIndex] &&
        this.sectionArray[sectionIndex].keyValuePairs.length > 1
      ) {
        this.sectionArray[sectionIndex].keyValuePairs.splice(pairIndex, 1);
      }
    },

    create_colum_names(count) {
      return Array.from({ length: count }, (_, i) => `Column ${i + 1}`);
    },

    add_row(sectionIndex) {
      const section = this.sectionArray[sectionIndex];
      const hasEmptyString = section.columnNames.some((item) => item === "");
      if (hasEmptyString) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: "Column Header is Missing",
          timeout: 5000,
          Top: true,
        };
      } else {
        if (section.rows.length == 0) {
          const newRow = section.columnNames.reduce((row, col) => {
            row[col] = "";
            return row;
          }, {});

          section.rows.push(newRow);
          this.sectiontabulatType = "";
          this.sectionchartsTypes = "";
        } else if (section.rows.length > 9) {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "Maximum 10 rows can be added",
            timeout: 5000,
            Top: true,
          };
        } else {
          var condtion = this.checkLastRow(section);
          if (condtion == true) {
            const newRow = section.columnNames.reduce((row, col) => {
              row[col] = "";
              return row;
            }, {});
            section.rows.push(newRow);
            this.sectiontabulatType = "";
            this.sectionchartsTypes = "";
          } else {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: "Enter the Column Value",
              timeout: 5000,
              Top: true,
            };
          }
        }
      }

      // const newRow = section.columnNames.reduce((row, col) => {
      //   row[col] = ""; // Initialize with empty string
      //   return row;
      // }, {});

      // section.rows.push(newRow);
      // console.log(section.rows);
      // this.sectiontabulatType = "";
      // this.sectionchartsTypes = "";
    },

    checkLastRow(section) {
      const lastRow = section.rows[section.rows.length - 1];
      const allValuesPresent = section.columnNames.every((col) => {
        return lastRow[col] !== undefined && lastRow[col] !== "";
      });

      return allValuesPresent;
    },

    remove_row(sectionIndex, rowIndex) {
      this.sectionArray[sectionIndex].rows.splice(rowIndex, 1);
    },

    addSeries(sectionIndex) {
      const section = this.sectionArray[sectionIndex];
      var data = this.sectionArray[sectionIndex].section_value;
      if (data.length > 0) {
        const lastItem = data[data.length - 1];
        if (
          lastItem.label === "" ||
          lastItem.x.length === 0 ||
          lastItem.y.length === 0
        ) {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "Please provide label and values",
            timeout: 5000,
            Top: true,
          };
        } else {
          var result = this.isMatch(lastItem);
          if (result == true) {
            if (this.sectionArray[sectionIndex]) {
              this.sectionArray[sectionIndex].section_value.push({
                label: "",
                x: [...section.section_value[0].x],
                y: [],
              });
              // console.log(this.sectionArray);
            }
          } else {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText:
                "Please provide x values  and y  values  are not appropriate",
              timeout: 5000,
              Top: true,
            };
          }
        }
      } else {
        // console.log("Array is empty. Nothing to check.");
      }
      // this.sectionArray[sectionIndex].section_value.push({
      //   label: "",
      //   x: [...section.section_value[0].x],
      //   y: [],
      // });
      // console.log(this.sectionArray);
    },
    isMatch(lastItem) {
      const { x, y } = lastItem;

      const yArray = Array.isArray(y)
        ? y
        : y
            .toString()
            .split(",")
            .map((value) => value.trim())
            .filter((value) => value !== "")
            .map(Number);

      if (Array.isArray(x) && Array.isArray(yArray)) {
        if (x.length === yArray.length) {
          if (x.every((item) => item.trim() !== "")) {
            return true;
          }
        }
      }

      return false;
    },
    removeSeries(sectionIndex, seriesIndex) {
      this.sectionArray[sectionIndex].section_value.splice(seriesIndex, 1);
    },

    // async publish_data() {
    //   this.finalPublishData = await this.getAllSectionData("normal");
    //   this.componentCheck = 1;
    //   this.previewPopup = true;
    // },
    async publish_data() {
      try {
        this.finalPublishData = await this.getAllSectionData();
        const result = await this.validatePublishData(this.finalPublishData);

        if (result == true) {
          this.componentCheck = 1;
          this.previewPopup = true;
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "Table data is missing",
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        // console.error("Error occurred while publishing data:", error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText:
            "The data format is incorrect. Please ensure all fields are formatted correctly  ",
          timeout: 5000,
          Top: true,
        };
      }
    },

    validatePublishData(finalPublishData) {
      let isValid = true;
      finalPublishData.forEach((section) => {
        if (section.section_type === "TABULAR") {
          section.section_value.forEach((tabularSection) => {
            if (
              Array.isArray(tabularSection.rows) &&
              tabularSection.rows.length === 0
            ) {
              isValid = false;
            }

            if (Array.isArray(tabularSection.headers)) {
              tabularSection.headers.forEach((header, index) => {
                if (header === "") {
                  // console.log(
                  //   `Error: Header at index ${index + 1} is empty in section: ${
                  //     section.section_name
                  //   }`
                  // );
                  isValid = false;
                }
              });
            }
          });
        }
      });

      return isValid;
    },

    async getAllSectionData(value) {
      try {
        const data = this.sectionArray
          .map((section) => {
            switch (section.sectionType) {
              case "Tabular":
                const tabularData = {
                  section_name: section.sectionTitle,
                  section_type: "TABULAR",
                  section_value: this.transformData(section),
                };

                return tabularData;
              case "Text":
                const textData = {
                  section_name: section.sectionTitle,
                  section_type: "TEXT",
                  body: section.body,
                };

                return textData;
              case "Pie Chart":
              case "Donut Chart":
                const pieChartData = {
                  section_name: section.sectionTitle,
                  section_type: section.chartSection
                    .toUpperCase()
                    .replace(" ", "_"),
                  section_value: section.keyValuePairs.map((pair) => ({
                    label: pair.key,
                    value: pair.value || 0,
                  })),
                };

                return pieChartData;

              case "Line Chart":
              case "Bar Chart":
              case "Column Chart":
                const chartData = {
                  section_name: section.sectionTitle,
                  section_type: section.chartSection
                    .toUpperCase()
                    .replace(" ", "_"),
                  section_value: section.section_value.map((series) => ({
                    label: series.label,
                    x: series.x,
                    y: series.y.split(",").map((value) => value.trim()),
                  })),
                };

                return chartData;
              //  throw new Error(`Unknown chart type: ${section.chartSection}`);
              default:
                throw new Error(`Unknown section type: ${section.sectionType}`);
            }
          })
          .filter((data) => data !== null);

        return value == "json" ? JSON.stringify(data) : data;
      } catch (error) {
        // console.error("Error in getAllSectionData:", error);
        throw error;
      }
    },
    // getAllSectionData(value) {

    //   const data = this.sectionArray
    //     .map((section) => {
    //       switch (section.sectionType) {
    //         case "Tabular":
    //           console.log("Tabular Section Data:", {
    //             section_name: section.sectionTitle,
    //             section_type: "TABULAR",
    //             section_value: this.transformData(section),
    //           });
    //           return {
    //             section_name: section.sectionTitle,
    //             section_type: "TABULAR",
    //             section_value: this.transformData(section),
    //           };
    //         case "Text":
    //           const textData = {
    //             section_name: section.sectionTitle,
    //             section_type: "TEXT",
    //             body: section.body,
    //           };
    //           return textData;
    //         case "Pie Chart":
    //         case "Donut Chart":

    //           const pieChartData = {
    //             section_name: section.sectionTitle,
    //             section_type: section.chartSection
    //               .toUpperCase()
    //               .replace(" ", "_"),
    //             section_value: section.keyValuePairs.map((pair) => ({
    //               label: pair.key,
    //               value: pair.value || 0,
    //             })),
    //           };

    //           return pieChartData;
    //         case "Line Chart":
    //         case "Bar Chart":
    //         case "Column Chart":

    //           const chartData = {
    //             section_name: section.sectionTitle,
    //             section_type: section.chartSection
    //               .toUpperCase()
    //               .replace(" ", "_"), // Convert to uppercase and replace spaces with underscores
    //             section_value: section.section_value.map((series) => ({
    //               label: series.label,
    //               x: series.x, // Ensure x values are in array
    //               y: series.y.split(",").map((value) => value.trim()), // Ensure y values are in array
    //             })),
    //           };

    //           return chartData;
    //         // }

    //         default:
    //           return null;
    //       }
    //     })
    //     .filter((data) => data !== null);

    //   // console.log("All Sections Data:", data);
    //   return value == "json" ? JSON.stringify(data) : data;
    // },

    transformData(data) {
      return [
        {
          headers: data.columnNames,
          rows: data.rows.map((row) =>
            data.columnNames.map((columnName) => row[columnName])
          ),
        },
      ];
    },

    //     .map((section) => {
    //       switch (section.sectionType) {
    //         case "Tabular":
    //           console.log("Tabular Section Data:", {
    //             section_name: section.sectionTitle,
    //             section_type: "TABULAR",
    //             section_columns: section.columnNames,
    //             section_rows: section.rows,
    //           });
    //           return {
    //             section_name: section.sectionTitle,
    //             section_type: "TABULAR",
    //             section_columns: section.columnNames,
    //             section_rows: section.rows,
    //           };
    //         case "Chart":
    //           if (section.chartSection === "Pie Chart") {
    //             const pieChartData = {
    //               section_name: section.sectionTitle,
    //               section_type: "PIE_CHART",
    //               section_value: section.keyValuePairs.map((pair) => ({
    //                 label: pair.key,
    //                 value: parseFloat(pair.value) || 0,
    //               })),
    //             };
    //             // console.log("Pie Chart Data:", pieChartData);
    //             return pieChartData;
    //           }
    //           return null;
    //         default:
    //           return null;
    //       }
    //     })
    //     .filter((data) => data !== null);

    //   console.log("All Sections Data:", data);
    //   return data;
    // },
    async get_dashboard(value) {
      try {
        let result = await API.graphql(
          graphqlOperation(dashboard_sections, {
            input: {
              dashboard_id:
                this.$store.getters.GetdashboardDetails.dashboard_id,
              action_type: this.queryErrorCheck == true ? "CREATE" : value,
              section_data:
                value == "EDIT" || this.queryErrorCheck == true
                  ? await this.getAllSectionData("json")
                  : undefined,
              dashboard_summary: this.summaryField,
            },
          })
        );
        var response = JSON.parse(result.data.dashboard_sections);

        if (response.Status == "SUCCESS") {
          this.loading2 = false;
          if (value == "EDIT") {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "green",
              SnackbarText: response.Message,
              timeout: 5000,
              Top: true,
            };
            this.sectionArray = [];
            this.queryErrorCheck = false;
            this.summaryField = "";
            this.get_dashboard("LIST");
          }

          if (value == "LIST") {
            const api = response.data[0].section_data;
            this.summaryField =
              response.data[0].dashboard_summary == undefined
                ? ""
                : response.data[0].dashboard_summary;

            var data = [];
            api.forEach((element, idx) => {
              data.push({
                sectionTitle: element.section_name,
                sectionType: this.fetch_section_names(element),
                secType: this.fetch_section_names(element),
                body: element.section_type == "TEXT" ? element.body : "",
                columnNames:
                  element.section_type === "TABULAR"
                    ? element.section_value[0].headers
                    : [],
                rows:
                  element.section_type === "TABULAR"
                    ? this.fethc_rows_data(element)
                    : [],
                chartSection: this.fetch_section_names(element),
                name: element.section_type,
                section_value:
                  element.section_type == "LINE_CHART" ||
                  element.section_type == "BAR_CHART" ||
                  element.section_type == "COLUMN_CHART"
                    ? this.fetch_graph_values(element.section_value, idx)
                    : [
                        {
                          label: "",
                          x: [],
                          y: [],
                        },
                      ],
                keyValuePairs:
                  element.section_type == "DONUT_CHART" ||
                  element.section_type == "PIE_CHART"
                    ? this.fetch_piedonut_values(element.section_value)
                    : [{ key: "", value: "" }],
                //
              });
            });

            this.sectionArray = data;
          }
        } else {
          this.queryErrorCheck = true;
          this.sectionArray = [];
        }
      } catch (error) {
        //console.log(error);
        this.decription = "";
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },

    fethc_rows_data(value) {
      const headers = value.section_value[0].headers;
      const rows = value.section_value[0].rows;
      const formattedData = rows.map((row) => {
        let obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index];
        });
        return obj;
      });
      return formattedData;
      //  const newRow = section.columnNames.reduce((row, col) => {
      //     row[col] = ""; // Initialize with empty string
      //     return row;
      //   }, {});
    },

    async fetch_sections_data(value) {
      if (this.sectionArray.length > 0 || value == "EDIT") {
        return await this.getAllSectionData("json");
      } else {
        return undefined;
      }
    },

    fetch_piedonut_values(values) {
      var data = [];
      values.forEach((element) => {
        data.push({
          key: element.label,
          value: element.value,
        });
      });
      return data;
    },

    fetch_graph_values(value, index) {
      // console.log(index);
      value.forEach((element) => {
        // element.x = element.x.join(",");
        element.y = element.y.join(",");
      });
      // console.log(value);
      return value;
    },

    fetch_section_names(value) {
      var data = "";
      switch (value.section_type) {
        case "PIE_CHART":
          data = "Pie Chart";
          break;
        case "BAR_CHART":
          data = "Bar Chart";
          break;
        case "COLUMN_CHART":
          data = "Column Chart";
          break;
        case "DONUT_CHART":
          data = "Donut Chart";
          break;
        case "LINE_CHART":
          data = "Line Chart";
          break;
        case "TEXT":
          data = "Text";
          break;
        case "TABULAR":
          data = "Tabular";
          break;
      }
      return data;
    },
  },
};
</script>

<style scoped>
.editor {
  border: 1px solid #ccc;
  padding: 10px;
  direction: ltr;
  min-height: 200px;
  overflow-y: auto;
}
.chart-container {
  display: flex;
  flex-direction: column;
  gap: 16px; /* Space between charts */
}

.chart-container > * {
  max-width: 100%; /* Ensure charts don't exceed the column width */
  height: auto; /* Maintain aspect ratio */
  overflow: hidden; /* Prevent overflow issues */
}
.fixed-header-height {
  height: auto; /* Set a fixed height */
  min-height: 40px; /* Ensure minimum height is consistent */
  line-height: 20px; /* Vertically center the content */
  padding: 0 18px; /* Optional: adjust padding */
}
</style>
