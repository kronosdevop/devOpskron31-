<template>
  <div>
    <v-toolbar class="mt-4 bg-white" density="compact" flat>
      <v-toolbar-title
        v-if="
          $store.getters.GetFormLibrary == false &&
          $store.getters.GetVisitorFormEnabled == false &&
          $store.getters.GetVisitorFormEdit == false
        "
      >
        Design Form for {{ $store.getters.GetFormName }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        v-if="$store.getters.GetFormLibrary == false"
        dark
        :disabled="formFields.length == 0"
        @click="preview_action()"
        class="text-capitalize cardCss text-white"
        >Preview</v-btn
      >
      <v-btn
        v-if="
          $store.getters.GetDirectoryForm == true &&
          $store.getters.GetFormLibrary == false
        "
        dark
        :disabled="formFields.length == 0"
        @click="save_directory_form()"
        class="text-capitalize ml-2 cardCss text-white"
        >Save</v-btn
      >
      <v-btn
        dark
        :disabled="formFields.length == 0"
        @click="save_visit_form()"
        v-if="$store.getters.GetVisitorFormEnabled == true"
        :loading="loadingvist"
        class="text-capitalize ml-2 cardCss text-white"
        >Save
      </v-btn>
      <v-btn
        dark
        :disabled="formFields.length == 0"
        @click="edit_visit_form()"
        v-if="$store.getters.GetVisitorFormEdit == true"
        :loading="loadingvist"
        class="text-capitalize ml-2 cardCss text-white"
        >Save
      </v-btn>
      <!-- &&
          $store.getters.GetFormObject.directory_created_by ===
            $store.getters.GetUserObj.user?.user_email_id -->
      <v-btn
        v-if="
          $store.getters.GetFormLibrary == false &&
          $store.getters.GetDirectoryForm == false &&
          $store.getters.GetVisitorFormEnabled == false &&
          $store.getters.GetVisitorFormEdit == false
        "
        dark
        :disabled="formFields.length == 0"
        @click="save_actions()"
        class="text-capitalize ml-2 cardCss text-white"
        >Save</v-btn
      >
      <v-btn
        v-show="
          $store.getters.GetDirectoryForm == false &&
          $store.getters.GetVisitorFormEnabled == false &&
          $store.getters.GetVisitorFormEdit == false
        "
        dark
        class="text-capitalize cardCss ml-2 text-white"
        @click="back_call()"
      >
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-toolbar>
    <v-card class="ma-2 mt-3" flat >
      <!-- <v-card-text> -->
      <v-row>
        <v-col
          cols="12"
          sm="12"
          md="8"
          xs="12"
          lg="7"
          v-if="$store.getters.GetFormLibrary == true"
          fill-height
        >
          <OverlayComp :overlay="overlay" />
          <v-card
            :loading="loading1"
            v-if="componentCheck == false"
            :height="cardHeight"
            over
            variant="outlined"
            class="card-content"
          >
            <v-list density="compact">
              <v-list-subheader class=""
                ><h2>Form Library</h2></v-list-subheader
              >
              <v-divider />
              <template v-for="(item, i) in items" :key="i">
                <v-list-item
                  @click="get_selected_form_item(item, i)"
                  density="compact"
                  color="primary"
                >
                  <v-list-item-title style="font-size: 15px">
                    <b>{{ item.form_name }}</b></v-list-item-title
                  >
                  <v-list-item-subtitle
                    class="text-left"
                    v-html="item.form_description"
                  ></v-list-item-subtitle>
                  <v-list-item-action
                    v-if="
                      formCheck == true &&
                      item.form_name == selectedFormValue.form_name
                    "
                    class="justify-end mt-n8"
                  >
                    <v-btn
                      size="x-small"
                      @click="use_template(item)"
                      color="primary"
                    >
                      Use Template
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
                <v-divider
                  v-if="i < items.length - 1"
                  :key="item.form_name"
                ></v-divider>
              </template>
            </v-list>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          sm="12"
          md="7"
          xs="4"
          v-if="$store.getters.GetFormLibrary == false"
          fill-height
        >
          <v-card
            v-if="componentCheck == false"
            variant="outlined"
            flat
            :height="cardHeight"
            over
            class="card-content"
          >
            <v-toolbar flat class="bg-white">
              <v-tabs v-model="tabs" align-tabs="center">
                <v-tab class="text-primary ml-6 text-capitalize">
                  Input Fields
                </v-tab>
                <v-tab class="text-primary ml-6 text-capitalize"
                  >Display Fields
                </v-tab>
                <v-tab
                  class="text-primary ml-6 text-capitalize"
                  v-if="formType == 'DEFAULT'"
                  >System Fields
                </v-tab>
                <v-tab class="text-primary ml-10 text-capitalize">Media </v-tab>
              </v-tabs>
            </v-toolbar>
            <v-tabs-window v-model="tabs" class="mr-4">
              <v-tabs-window-item>
                <v-row no-gutters>
                  <v-col
                    v-for="item in inputFields"
                    class="mt-1 pa-1 text-right"
                    :key="item.type"
                    cols="4"
                  >
                    <v-btn
                      shaped
                      block
                      class="ma-2"
                      @click="fetch_selected_item(item)"
                    >
                      <v-row justify="start">
                        <v-icon left small>{{ item.icon }}</v-icon>
                        <div class="text-left" style="font-size: small">
                          {{ item.label }}
                        </div>
                      </v-row>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-tabs-window-item>

              <v-tabs-window-item>
                <v-row no-gutters>
                  <v-col
                    v-for="item in displayFields"
                    class="mt-1 pa-1 text-right"
                    :key="item.type"
                    cols="4"
                  >
                    <v-btn
                      shaped
                      block
                      class="ma-2"
                      @click="fetch_selected_item(item)"
                    >
                      <v-row justify="start">
                        <v-icon left small>{{ item.icon }}</v-icon>
                        <div class="text-left" style="font-size: small">
                          {{ item.label }}
                        </div>
                      </v-row>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-tabs-window-item>

              <v-tabs-window-item v-if="formType == 'DEFAULT'">
                <v-row no-gutters>
                  <v-col
                    v-for="item in activeFields"
                    class="mt-1 pa-1 text-right"
                    :key="item.type"
                    cols="4"
                  >
                    <v-btn
                      shaped
                      block
                      class="ma-2"
                      @click="fetch_selected_item(item)"
                    >
                      <v-row justify="start">
                        <v-icon left small>{{ item.icon }}</v-icon>
                        <div class="text-left" style="font-size: small">
                          {{ item.label }}
                        </div>
                      </v-row>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-tabs-window-item>

              <v-tabs-window-item>
                <v-row no-gutters>
                  <v-col
                    v-for="item in mediaFields"
                    class="mt-1 pa-1 text-right"
                    :key="item.type"
                    cols="4"
                  >
                    <v-btn
                      shaped
                      block
                      class="ma-2"
                      @click="fetch_selected_item(item)"
                    >
                      <v-row justify="start">
                        <v-icon left small>{{ item.icon }}</v-icon>
                        <div class="text-left" style="font-size: small">
                          {{ item.label }}
                        </div>
                      </v-row>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-tabs-window-item>

              <v-tabs-window-item>
                <v-row no-gutters>
                  <v-col
                    v-for="item in compositeFields"
                    class="mt-1 pa-1 text-right"
                    :key="item.type"
                    cols="4"
                  >
                    <v-btn
                      shaped
                      block
                      class="ma-2"
                      @click="fetch_selected_item(item)"
                    >
                      <v-row justify="start">
                        <v-icon left small>{{ item.icon }}</v-icon>
                        <div class="text-left" style="font-size: small">
                          {{ item.label }}
                        </div>
                      </v-row>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card>
          <v-card
            flat
            over
            :height="cardHeight"
            class="card-content"
            variant="outlined"
            v-if="componentCheck == true"
          >
            <v-card-title class="justify-center">
              <v-row>
                <v-col cols="12" sm="10"> Edit Field </v-col>
                <v-col cols="12" sm="2" class="justify-end">
                  <v-btn
                    size="small"
                    class="cardCss text-white"
                    @click="back_action()"
                    >back</v-btn
                  >
                </v-col>
              </v-row>
            </v-card-title>

            <v-card-text>
              <!-- v-show="
                    formFields.length == 1 &&
                    this.$store.getters.GetDirectoryForm == true &&
                    $store.getters.GetFormObject.is_directory_designed == false
                  " -->
              <!-- formFields.length == 1 &&  -->
              <v-form ref="formlabel">
                <v-select
                  density="compact"
                  v-show="
                    showTitleCheck == 1 &&
                    $store.getters.GetDirectoryForm == true &&
                    $store.getters.GetFormObject.is_directory_designed == false
                  "
                  v-model="selectdirectoryFieldType"
                  label="Field Type"
                  :items="[
                    { label: 'TEXTFIELD', value: 'TEXTFIELD' },
                    { label: 'DATE', value: 'DATE' },
                    { label: 'NUMBER', value: 'NUMBER' },
                    { label: 'Date and Time', value: 'DATETIME' },
                  ]"
                  item-title="label"
                  item-value="value"
                  @input="rearrange_form_type(selectdirectoryFieldType)"
                  variant="outlined"
                />

                <v-text-field
                  v-show="
                    showTitleCheck == 0 &&
                    $store.getters.GetDirectoryForm == true
                  "
                  density="compact"
                  readonly
                  v-model="selectedItem.type"
                  label="Field Type"
                  variant="outlined"
                />
                <v-text-field
                  v-show="$store.getters.GetDirectoryForm == false"
                  density="compact"
                  readonly
                  v-model="selectedItem.type"
                  label="Field Type"
                  variant="outlined"
                />
                <!-- v-show="formFields.length != 1" -->
                <v-textarea
                  density="compact"
                  :readonly="
                    showTitleCheck === 1 &&
                    $store.getters.GetDirectoryForm &&
                    $store.getters.GetFormObject.is_directory_designed
                  "
                  row-height="10"
                  rows="1"
                  auto-grow
                  :rules="[(v) => !!v || 'Required']"
                  variant="outlined"
                  v-model="labelToDisplay"
                  label="Label To Display"
                  @input="get_input_value(labelToDisplay)"
                />
              </v-form>

              <!--   @change="get_value_dat(madatoryField)" -->
              <v-checkbox
                v-if="
                  selectedItem.backend_type != 'label' &&
                  selectedItem.backend_type != 'gallery' &&
                  selectedItem.backend_type != 'rating' &&
                  selectedItem.backend_type != 'boolean'
                "
                class="mt-n1"
                v-model="madatoryField"
                :readonly="showTitleCheck == 1"
                label="Mandatory Field*"
                @change="get_mandatory_value(madatoryField)"
              ></v-checkbox>
              <!-- <v-checkbox
                v-show="
                  showTitleCheck == 0 && $store.getters.GetDirectoryForm == true
                "
                class="mt-n1"
                v-model=""
                label="Is Editable"
                @change="get_hidden_value(hideOncreation)"
              ></v-checkbox> -->
              <v-checkbox
                v-show="
                  showTitleCheck == 0 &&
                  $store.getters.GetDirectoryForm == true &&
                  $store.getters.GetExternalForm == true
                "
                class="mt-n1"
                v-model="hideOncreation"
                label="Hide On Initial Submission"
                @change="get_hidden_value(hideOncreation)"
              ></v-checkbox>

              <div
                v-if="
                  selectedItem.backend_type == 'string' ||
                  selectedItem.backend_type == 'paragraph' ||
                  selectedItem.backend_type == 'number' ||
                  selectedItem.backend_type == 'time' ||
                  selectedItem.backend_type == 'date'
                "
              >
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      variant="outlined"
                      :rules="[(v) => !!v || 'Required']"
                      density="compact"
                      @keypress="is_number($event)"
                      v-on:paste="process($event)"
                      v-model="minvalue"
                      v-if="
                        selectedItem.backend_type != 'time' &&
                        selectedItem.backend_type != 'date'
                      "
                      :label="
                        selectedItem.backend_type === 'number'
                          ? 'Min value'
                          : 'Minimum Characters'
                      "
                      style="width: 250px"
                      @change="get_min_value(minvalue)"
                    />
                  </v-col>
                  <!-- label="Min value" -->
                  <v-col cols="6">
                    <v-text-field
                      variant="outlined"
                      :rules="[(v) => !!v || 'Required']"
                      @keypress="is_number($event)"
                      v-on:paste="process($event)"
                      density="compact"
                      v-model="maxvalue"
                      v-if="
                        selectedItem.backend_type != 'time' &&
                        selectedItem.backend_type != 'date'
                      "
                      :label="
                        selectedItem.backend_type === 'number'
                          ? 'Max value'
                          : 'Maximum Characters'
                      "
                      style="width: 250px"
                      @change="get_max_value(maxvalue)"
                    />
                  </v-col>
                  <!-- <v-col cols="12">
                    <v-radio-group
                      v-model="datetimevalidation"
                      v-if="selectedItem.backend_type == 'date'"
                      column
                      class="mt-n8"
                      @change="get_daterange_value(datetimevalidation)"
                    >
                      <v-radio
                        label="Allow past date including current date"
                        value="pastDates"
                      ></v-radio>
                      <v-radio
                        label="Allow future  date Only including current date"
                        value="futureDates"
                      ></v-radio>
                      <v-radio label="Current Date" value="currentDate"></v-radio>
                      <v-radio label="Any" value="any"></v-radio>
                    </v-radio-group>
                  </v-col> -->
                </v-row>
              </div>
              <div v-if="selectedItem.type == 'DROPDOWN'">
                <v-form ref="form">
                  <v-row no-gutters>
                    <v-col>
                      <v-text-field
                        variant="outlined"
                        density="compact"
                        v-model="fieldData"
                        :rules="[
                          (v) => (v && v.trim().length > 0) || 'Required',
                        ]"
                        label="Options"
                        style="width: 250px"
                      />
                    </v-col>
                    <v-col>
                      <v-btn
                        @click="add_options(fieldData)"
                        class="elevation-0 ml-2"
                        fab
                        x-small
                      >
                        <v-icon dark> mdi-plus </v-icon>
                      </v-btn>
                    </v-col>
                    <v-col>
                      <UploadExcel
                        :on-success="handleSuccess"
                        :before-upload="beforeUpload"
                      />
                      <!-- <v-btn
                        @click="downloadExcel"
                        dark
                        color="primaryColor"
                        v-if="globalOptions.length >= 1"
                        class="mt-1"
                        >Download Excel</v-btn
                      > -->
                    </v-col>
                  </v-row>
                </v-form>

                <v-chip-group column>
                  <v-chip
                    v-for="(item, index) in globalOptions"
                    :key="index"
                    closable
                    :close="globalOptions.length > 1"
                    @click:close="
                      globalOptions.length > 1 ? delete_data(index) : null
                    "
                  >
                    {{ item }}
                  </v-chip>
                </v-chip-group>

                <!-- <v-list>
                  <v-list-item
                    v-for="(item, index) in globalOptions"
                    :key="item"
                  >
                    <v-list-item-content>
                      <v-list-item-title>{{ item }}</v-list-item-title>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-icon
                        @click="delete_data(index)"
                        small
                        v-show="globalOptions.length > 1"
                        >mdi-delete</v-icon
                      >
                    </v-list-item-action>
                  </v-list-item>
                </v-list> -->
              </div>
              <div v-if="selectedItem.type == 'GALLERY'">
                <v-toolbar density="compact" class="rounded elevation-1 pa-2"
                  ><b> Add Image</b> <v-spacer />
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileChange"
                    style="display: none"
                    accept="image/*"
                  />
                  <v-btn
                    v-show="signimagesarrayurls.length < 5"
                    dark
                    class="text-capitalize cardCss text-white"
                    @click="$refs.fileInput.click()"
                    small
                    :loading="uploadload"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-toolbar>
                <v-card flat class="overflow-auto overflow-x-hidden ma-2">
                  <v-card
                    class="ma-8"
                    flat
                    v-for="(signimagesarrayurls, index) in converteUrl"
                    :key="index"
                  >
                    <v-row>
                      <v-col cols="6">
                        <v-img
                          max-height="100"
                          contain
                          :src="signimagesarrayurls"
                          v-if="signimagesarrayurls.length > 1"
                        >
                        </v-img>
                      </v-col>
                      <v-col cols="2">
                        <v-btn
                          icon
                          class="mt-4"
                          @click="delete_item(signimagesarrayurls, index)"
                        >
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-card>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn
                class="text-capitalize cardCss text-white"
                dark
                
                v-if="editable == false"
                @click="add_field()"
                style="width: 250px"
                >Add Field</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="12" md="5" xs="12">
          <AdminFormView
            :key="refreshComp"
            :formFields="formFields"
            v-on:editValue="get_edit_field"
            v-on:editIndex="get_edit_index"
          />
        </v-col>
      </v-row>
      <!-- </v-card-text> -->

      <div v-if="previewCheck == 1">
        <FormPusblishDialog
          :publishFormDialog="publishFormDialog"
          :formDataArray="formDataArray"
          v-on:errorMsg="error_info"
          v-on:successMsg="get_completeion"
          v-on:onPublish="navigate_path"
          @clicked="publishFormDialog = false"
        />
      </div>
      <div v-if="previewCheck == 2">
        <FormPreview
          :previewDialog="previewDialog"
          :formFields="formFields"
          @clicked="previewDialog = false"
        />
      </div>
      <div v-if="previewCheck == 3">
        <DropdownUpload
          :dropExceldailog="dropExceldailog"
          @clicked="dropExceldailog = false"
          :excelHeaders="excelHeaders"
          :excelTableData="excelTableData"
          @dropdown="updateitems"
        />
      </div>
      <div v-if="previewCheck == 4">
        <DirectoryFormSave
          :directoryFormDialog="directoryFormDialog"
          :formDataArray="formDataArray"
          v-on:successMsg="directory_Success"
          @clicked="directoryFormDialog = false"
        />
      </div>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
  </div>
</template>
<script>
/*eslint-disable*/
import { API, graphqlOperation, Auth } from "aws-amplify";
import { deleteS3SignedUrl } from "@/mixins/S3DeleteStorageFile";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import {
  draft_custom_form,
  Visit_type_creation,
  edit_visittype_form,
} from "@/graphql/mutations.js";
import { get_visit_type_form } from "@/graphql/queries.js";
import * as XLSX from "xlsx";
import CountryList from "@/JsonFiles/CountryList.json";
import DropdownUpload from "@/components/FormDesigner/FormDialogs/DropdownUpload.vue";
import AdminFormView from "@/components/FormDesigner/AdminFormView.vue";
import FormPreview from "@/components/FormDesigner/FormDialogs/FormPreview.vue";
import FormPusblishDialog from "@/components/FormDesigner/FormDialogs/FormPusblishDialog.vue";
import DirectoryFormSave from "@/components/LookitUPDirectiory/AllDialogs/DirectoryFormSave.vue";
import { get_all_from_libraries } from "@/mixins/GetFormLibrary.js";
import UploadExcel from "@/components/UploadExcel/IndexList.vue";
import OverlayComp from "@/components/OverlayComp.vue";
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    AdminFormView,
    FormPreview,
    FormPusblishDialog,
    OverlayComp,
    SnackBar,
    DropdownUpload,
    UploadExcel,
    CountryList,
    DirectoryFormSave,
  },
  mixins: [get_all_from_libraries],
  data() {
    return {
      SnackBarComponent: {},
      formAction: "",
      minvalue: "1",
      datetimevalidation: "past_future",
      formType: "DEFAULT",
      maxvalue: "100",
      dropExceldailog: false,
      panel: [0],
      tabs: 0,
      refreshComp: 0,
      selectdirectoryFieldType: "TEXTFIELD",
      inputFields: [
        {
          type: "TEXTFIELD",
          icon: "mdi-text-recognition",
          label: "Text",
          backend_type: "string",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "PARAGRAPH",
          icon: "mdi-text-box",
          label: "Paragraph",
          backend_type: "paragraph",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "NUMBER",
          icon: "mdi-numeric",
          label: "Number",
          backend_type: "number",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "MOBILENUMBER",
          icon: "mdi-phone",
          label: "Mobile Number",
          backend_type: "phonenumber",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "EMAIL",
          icon: "mdi-email",
          label: "Email",
          backend_type: "email",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "DROPDOWN",
          icon: "mdi-format-list-bulleted-square",
          label: "Dropdown",
          backend_type: "single_choice",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "CHECKBOX",
          icon: "mdi-checkbox-outline",
          label: "Checkbox",
          backend_type: "checkbox",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "TIME",
          icon: "mdi-timer",
          label: "Time",
          backend_type: "time",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "DATE",
          icon: "mdi-calendar",
          label: "Date",
          backend_type: "date",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "NAME",
          icon: "mdi-account",
          label: "Name",
          backend_type: "string",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },

        {
          type: "FLIPSWITCH",
          icon: "mdi-toggle-switch",
          label: "Flip Switch",
          backend_type: "boolean",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },

        {
          type: "RATING",
          icon: "mdi-star-outline",
          label: "Ratings",
          backend_type: "rating",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },

        {
          type: "URL",
          icon: "mdi-link",
          label: "URL",
          backend_type: "url",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },

        {
          type: "YOUTUBE",
          icon: "mdi-youtube",
          label: "Youtube",
          backend_type: "youtube",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },

        {
          type: "COUNTRYLIST",
          icon: "mdi-earth",
          label: "Country List",
          active_field_type: "country_list",
          backend_type: "single_choice",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },

        {
          type: "DATETIME",
          icon: "mdi-earth",
          label: "Date and Time",
          backend_type: "datetime",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },

        {
          type: "YEAR",
          icon: "mdi-calendar-today",
          label: "Year",
          backend_type: "year",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
      ],
      displayFields: [
        {
          type: "LABEL",
          icon: "mdi-label",
          label: "Label",
          backend_type: "label",
          is_displayed: true,
          is_readonly: false,
          is_required: false,
          hide_on_creation: false,
        },
        {
          type: "GALLERY",
          icon: "mdi-image-outline",
          label: "Image",
          backend_type: "gallery",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
      ],
      mediaFields: [
        {
          type: "MEDIA",
          icon: "mdi-camera",
          label: "Media",
          backend_type: "media",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
      ],
      activeFields: [
        {
          type: "TEAMLIST",
          icon: "mdi-account-group",
          label: "Teams",
          active_field_type: "team_list",
          backend_type: "single_choice",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "GROUPLIST",
          icon: "mdi-group",
          label: "Groups",
          active_field_type: "group_list",
          backend_type: "single_choice",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "LOCATIONLIST",
          icon: "mdi-map-marker-multiple",
          label: "Locations",
          active_field_type: "location_list",
          backend_type: "single_choice",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "DESIGNATIONLIST",
          icon: "mdi-mail",
          label: "Designations",
          backend_type: "single_choice",
          active_field_type: "designation_list",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "CUSTOMERSLIST",
          icon: "mdi-mail",
          label: "Customers",
          backend_type: "single_choice",
          active_field_type: "list_all_customers",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "PRODUCTSLIST",
          icon: "mdi-mail",
          label: "Products/Services",
          backend_type: "single_choice",
          active_field_type: "list_all_sub_categories",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "VENDORSLIST",
          icon: "mdi-mail",
          label: "Suppliers/Vendors",
          backend_type: "single_choice",
          active_field_type: "list_asset_supliers",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "MULTICHOICE",
          icon: "mdi-account-multiple",
          label: "Multiple User Picker",
          backend_type: "multi_choice",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
      ],
      compositeFields: [
        {
          type: "CountryStateList",
          icon: "mdi-earth",
          label: "Country and State List",
          backend_type: "countrystatelist",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
      ],
      cardHeight: 0,
      componentCheck: false,
      selectedItem: {},
      loadingvist: false,
      labelToDisplay: "",
      formFields: [],
      count: 0,
      fieldData: "",
      globalOptions: [],
      displayOption: 0,
      madatoryField: false,
      editable: true,
      previewCheck: 0,
      previewDialog: false,
      uploadload: false,
      publishFormDialog: false,
      formDataArray: [],
      items: [],
      excelHeaders: [],
      formCheck: false,
      selectedFormValue: {},
      loading1: false,
      overlay: false,
      regularS3URLsnew: [],
      arrayurls: [],
      signimagesarrayurls: [],
      converteUrl: [],
      excelTableData: [],
      directoryFormDialog: false,
      fieldChangeChecck: false,
      showTitleCheck: 0,
      hideOncreation: false,
    };
  },
  computed: {
    shouldShowSelect() {
      // Conditions for showing v-select
      return (
        this.formFields.length === 1 &&
        this.$store.getters.GetDirectoryForm === true
      );
    },
    // formFields() {
    //   // Replace with your actual computed property for formFields
    //   return this.$store.getters.formFields;
    // },
  },
  async mounted() {
    if (this.$store.getters.GetEditFormDetails.FlowValue == undefined) {
      this.formType = "DEFAULT";
    } else {
      this.formType =
        this.$store.getters.GetEditFormDetails.FlowValue.workflow_design_type ==
        undefined
          ? "DEFAULT"
          : this.$store.getters.GetEditFormDetails.FlowValue
              .workflow_design_type;
    }

    this.formFields = [];
    this.fieldChangeChecck = false;
    var formData = this.$store.getters.GetFormObject;

    if (
      this.$store.getters.GetDirectoryForm == false &&
      formData.is_form_designed == true
    ) {
      this.formFields = formData.form_design_template;
      // for (let i = 0; i < this.formFields.length; i++) {
      //   const obj = this.formFields[i];
      //   obj.regularurl = [];
      //   if (obj.type === "GALLERY") {
      //     for (let j = 0; j < obj.fieldOptions.length; j++) {
      //       const converted = this.s3convert(obj.fieldOptions[j]);
      //       // obj.fieldOptions[j] = converted;
      //       obj.regularurl[j] = converted;
      //     }
      //   }
      // }
    }

    if (
      this.$store.getters.GetDirectoryForm == true &&
      formData.is_directory_designed == true
    ) {
      this.formFields = formData.directory_design_template;
      // for (let i = 0; i < this.formFields.length; i++) {
      //   const obj = this.formFields[i];
      //   if (obj.type === "GALLERY") {
      //     for (let j = 0; j < obj.fieldOptions.length; j++) {
      //       if (!this.isPresignedUrl(obj.fieldOptions[j])) {
      //         obj.fieldOptions[j] = this.s3convert(obj.fieldOptions[j]);
      //       }
      //     }
      //   }
      // }
    }
    // console.log(this.$store.getters.GetCustomFormDesign);
    // console.log(
    //   this.$store.getters.GetCustomFormDesign,
    //   this.$store.getters.GetDirectoryForm,
    //   formData.is_directory_designed
    // );
    if (
      this.$store.getters.GetCustomFormDesign == true ||
      (this.$store.getters.GetDirectoryForm == true &&
        formData.is_directory_designed == false)
    ) {
      var data = [
        {
          backend_type: "string",
          displayLabel: "Title",
          fieldOptions: [],
          icon: "mdi-text-recognition",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          label: "Title",
          max_value: 100,
          min_value: 1,
          type: "TEXTFIELD",
          hide_on_creation: false,
        },
      ];
      this.fieldChangeChecck = true;
      this.formFields = data;
    }

    if (this.$store.getters.GetFormLibrary == true) {
      this.overlay = true;
      this.formFields = [];
      await this.get_all_from_libraries();
      this.overlay = false;
      // this.items = this.globalForms;
      this.items = [];
      var formarray = [];
      formarray = this.globalForms;
      var dataform = this.$store.getters.Getlibraryformtype;
      if (dataform == "FORM_LIBRARY") {
        this.items = formarray.filter(
          (form) => form.form_type === "FORM_LIBRARY"
        );
      } else if (dataform === "DIRECTORY_FORM_LIBRARY") {
        this.items = formarray.filter(
          (form) => form.form_type === "DIRECTORY_FORM_LIBRARY"
        );
      } else if (dataform === "") {
        this.items = formarray;
      }
    }
    this.cardHeight = window.innerHeight - 171;
    if (this.$store.getters.GetVisitorFormEdit == true) {
      this.formFields = [];
      this.GetvisitForm();
    }
  },

  methods: {
    downloadExcel() {
      const workbook = XLSX.utils.book_new();
      const worksheetData = this.globalOptions.map((option) => [option]);
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "GlobalOptions");
      XLSX.writeFile(workbook, "globalOptions.xlsx");
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

    async rearrange_form_type(value) {
      var data = {};
      this.selectedItem = {};
      this.refreshComp = 0;
      this.formFields[0] = {};
      this.fieldChangeChecck = true;
      if (value == "NUMBER") {
        data = {
          type: "NUMBER",
          icon: "mdi-numeric",
          label: "Number",
          backend_type: "number",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          displayLabel: "Number",
          max_value: 10000000,
          min_value: 0,
          fieldOptions: [],
          hide_on_creation: false,
        };

        this.labelToDisplay = "Number";
        this.minvalue = 0;
        this.maxvalue = 10000000;
        // this.selectedItem = data;

        // this.add_title_filed(data);
        // this.get_edit_field(data);
      } else if (value == "DATE") {
        data = {
          type: "DATE",
          icon: "mdi-calendar",
          label: "Date",
          backend_type: "date",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          displayLabel: "Date",
          hide_on_creation: false,
          fieldOptions: [],
        };

        this.labelToDisplay = "Date";
        // this.selectedItem = data;
        // this.add_title_filed(data);

        // this.get_edit_field(data);
      } else if (value == "TEXTFIELD") {
        data = {
          backend_type: "string",
          displayLabel: "Title",
          fieldOptions: [],
          icon: "mdi-text-recognition",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          label: "Title",
          max_value: 100,
          min_value: 1,
          type: "TEXTFIELD",
          hide_on_creation: false,
        };
        this.labelToDisplay = "Title";
        // this.selectedItem = data;
        // this.add_title_filed(data);

        // this.get_edit_field(data);
      } else if (value == "DATETIME") {
        data = {
          type: "DATETIME",
          icon: "mdi-earth",
          label: "Date and Time",
          backend_type: "datetime",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          displayLabel: "Date and Time",
          fieldOptions: [],
          hide_on_creation: false,
        };

        this.labelToDisplay = "Date and Time";
        // this.selectedItem = data;
        // this.add_title_filed(data);
        // this.get_edit_field(data);
      }
      this.selectedItem = data;

      await this.add_title_filed(data); // Call add_title_filed with the selected data
      this.refreshComp++;
      // console.log(this.selectedItem);
      // this.selectedItem = data;
      // this.add_title_filed(data);
      // this.get_edit_field(data);

      // this.formFields[0] = data;

      // console.log(this.formFields);
    },

    add_title_filed(value) {
      // Label doesn't exist, log a message
      this.formFields[0] = value;
      // if (value.backend_type == "string" || value.backend_type == "number") {
      //   this.formFields[0] = {
      //     type: value.type,
      //     label: value.label,
      //     icon: value.icon,
      //     backend_type: value.backend_type,
      //     displayLabel: value.displayLabel,
      //     is_displayed: true,
      //     is_readonly: false,
      //     is_required: this.madatoryField,
      //     min_value: Number(this.minvalue),
      //     max_value: Number(this.maxvalue),
      //     fieldOptions: [],
      //   };
      //   // this.componentCheck = false;

      //   // this.datetimevalidation = "past_future";
      // } else {
      //   this.formFields[0] = value;

      //   // this.componentCheck = false;
      // }

      this.refreshComp++;
      // console.log(this.formFields);
    },

    fetch_selected_item(value) {
      if (value.type == "PARAGRAPH") {
        this.minvalue = 1;
        this.maxvalue = 1000;
      }
      if (value.type == "NUMBER") {
        this.minvalue = 0;
        this.maxvalue = 10000000;
      }
      this.fieldChangeChecck = false;
      this.selectedItem = {};
      this.labelToDisplay = "";
      this.componentCheck = true;
      this.selectedItem = value;
      this.labelToDisplay = value.label;
      this.madatoryField = false;
      this.hideOncreation = false;
      this.globalOptions = [];
      this.signimagesarrayurls = [];
      this.converteUrl = [];
      this.editable = false;
      this.showTitleCheck = 0;
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

    updateitems(val) {
      this.dropExceldailog = false;
      var array = val;
      let uniqueItems = new Set();
      array.forEach((item) => {
        uniqueItems.add(item.dropdownitems);
      });
      let finalArray = Array.from(uniqueItems);
      // Merge finalArray with globalArray, removing any duplicates
      this.globalOptions = [...new Set([...this.globalOptions, ...finalArray])];
    },

    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1;
      if (isLt1M) {
        return true;
      }
      this.$message({
        message: "Please do not upload files larger than 1m in size.",
        type: "warning",
      });
      return false;
    },
    handleSuccess({ results, header }) {
      this.excelTableData = results;

      this.excelHeaders = header;
      this.previewCheck = 3;
      this.dropExceldailog = true;
    },
    async handleFileChange(event) {
      const files = event.target.files[0];
      if (!files) {
        // console.log("No fileData, exiting function");
        return;
      }
      await Auth.currentCredentials();
      const orgDetails = this.$store.getters.GetOrgDetails;

      const userId = this.$store.getters.GetUserObj.user?.user_id;

      const key =
        "workflow" +
        "/" +
        orgDetails.organization.organization_id +
        "/" +
        userId +
        "/" +
        Date.now() +
        "/" +
        this.replaceSpecialCharacters(files.name);
      try {
        const fileUrl = await uploadToS3(files, orgDetails.s3_details, key);
        if (fileUrl) {
          this.signimagesarrayurls.push(fileUrl);
          const details = this.$store.getters.GetOrgDetails;
          const signedUrl = await getS3SignedUrl(fileUrl, details.s3_details);
          if (signedUrl) {
            this.converteUrl.push(signedUrl);
            this.contentdocumentFiles = [];
            this.refreshComp++;
          }
        }
      } catch (err) {
        // console.log(err);
      }
      // await this.upload_S3(files[0]);
    },
    s3convert(urls) {
      var response = this.$store.getters.GetOrgDetails;
      var s3Bucket = new AWS.S3({
        region: response.s3_details.region,
        accessKeyId: response.s3_details.access_key,
        secretAccessKey: response.s3_details.secret_key,
        signatureVersion: "v4",
      });
      var params = {
        Bucket: response.s3_details.bucket_name,
        Key: "workflow/" + urls.split("workflow/")[1],
        Expires: 60000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);

      return url;
    },
    isPresignedUrl(url) {
      return url.includes("X-Amz-Signature");
    },
    async upload_S3(files) {
      this.uploadload = true;
      var imageUrl = [];
      var newUrl = [];
      var baseData = [];
      var file = files;
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.addEventListener("load", () => {
        imageUrl = fr.result;
        newUrl = imageUrl;
        newUrl = imageUrl.replace("data:" + file.type + ";base64,", "");
        baseData.push(newUrl);
        this.upload_S3_bucket(baseData[0], file);
      });
    },
    replaceSpecialCharacters(key) {
      return key.replace(/[^a-zA-Z0-9.]+/g, "");
    },

    async upload_S3_bucket(baseData, file) {
      var self = this;
      var deatils = self.$store.getters.GetOrgDetails;
      var buf = Buffer.from(baseData, "base64");
      var s3Bucket = new AWS.S3({
        region: deatils.s3_details.region,
        accessKeyId: deatils.s3_details.access_key,
        secretAccessKey: deatils.s3_details.secret_key,
      });
      var bucketName = deatils.s3_details.bucket_name;
      var params = {
        Bucket: bucketName,
        Key:
          "workflow" +
          "/" +
          deatils.organization.organization_id +
          "/" +
          self.$store.getters.GetUserObj.user?.user_id +
          "/" +
          Date.now() +
          "/" +
          self.replaceSpecialCharacters(file.name),

        Body: buf,
        ContentType: file.type,
      };
      var bucketurl =
        "https://" +
        bucketName +
        ".s3." +
        deatils.s3_details.region +
        ".amazonaws.com/" +
        params.Key;

      await s3Bucket.putObject(params, function (err, data) {
        if (err) {
          this.loading1 = false;
        } else if (data) {
          bucketurl;
          var deatil = self.$store.getters.GetOrgDetails;
          self.urls = bucketurl;
          self.s3get(deatil);
        }

        self.contentdocumentFiles = [];
      });
      this.uploadload = false;
    },

    async delete_item(val, index) {
      try {
        const matchedurl = this.signimagesarrayurls.find((url) =>
          val.includes(url)
        );

        const baseIndex =
          matchedurl.indexOf("amazonaws.com/") + "amazonaws.com/".length;
        const key = matchedurl.substring(baseIndex);

        const result = await deleteS3SignedUrl(key);
        if (result) {
          this.signimagesarrayurls.splice(index, 1);
          this.converteUrl.splice(index, 1);
          this.refreshComp++;
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
      // var self = this;
      // var deatils = self.$store.getters.GetOrgDetails;
      // this.delLoading = true;
      // var s3Bucket = new AWS.S3({
      //   region: deatils.s3_details.region,
      //   accessKeyId: deatils.s3_details.access_key,
      //   secretAccessKey: deatils.s3_details.secret_key,
      // });
      // var bucketName = deatils.s3_details.bucket_name;

      // var params = {
      //   Bucket: bucketName,
      //   Key: val,
      // };

      // await s3Bucket.deleteObject(params, function (err, data) {
      //   if (err) {
      //     // console.log(err);
      //   } else if (data) {
      //     self.signimagesarrayurls.forEach((element) => {
      //       if (element == val) {
      //         self.signimagesarrayurls.splice(index, 1);
      //       }
      //     });
      //   }
      // });
    },

    s3get(response) {
      var s3Bucket = new AWS.S3({
        region: response.s3_details.region,
        accessKeyId: response.s3_details.access_key,
        secretAccessKey: response.s3_details.secret_key,
        signatureVersion: "v4",
      });
      var params = {
        Bucket: response.s3_details.bucket_name,
        Key: "workflow/" + this.urls.split("workflow/")[1],
        Expires: 60000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);
      this.signimagesarrayurls.unshift(url);
    },

    // async handleFileChange(event) {
    //   const files = event.target.files;
    //   // Process the selected files
    //   await this.upload_S3(files[0]);
    // },

    get_selected_form_item(item) {
      this.formCheck = true;
      this.selectedFormValue = item;
      this.formFields = item.form_design_template;
    },

    use_template(value) {
      if (this.$store.getters.GetDirectoryForm == true) {
        this.$store.commit("Setlibraryformtype", "");
        this.$store.commit("SetformLibrary", false);
        this.$store.commit("SetVisitorFormEnabled", false);
        this.$store.commit("SetVisitorFormEdit", false);
      } else {
        this.$store.commit("SetFormName", value.form_name);
        this.$store.commit("SetVisitorFormEnabled", false);
        this.$store.commit("SetVisitorFormEdit", false);

        this.$store.commit("SetFormObj", value);
        this.$store.commit("SetformLibrary", false);
        this.$store.commit("Setlibraryformtype", "");
      }

      // this.$store.commit("SetDirectoryForm", false);
    },

    checkLabelExists(array, namelabel) {
      for (let i = 0; i < array.length; i++) {
        if (array[i].displayLabel === namelabel) {
          return true;
        }
      }
      // If label doesn't exist, return false
      return false;
    },

    add_field() {
      this.minvalue = this.minvalue.toString();
      if (this.$refs.formlabel.validate()) {
        const labelExists = this.checkLabelExists(
          this.formFields,
          this.labelToDisplay
        );
        if (!labelExists) {
          // Label doesn't exist, log a message

          if (
            this.selectedItem.type == "DROPDOWN" &&
            this.globalOptions.length == 0 &&
            (!this.fieldData || this.fieldData.trim().length === 0)
          ) {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: "Add atleast One Option",
              timeout: 5000,
              Top: true,
            };
          } else if (
            this.selectedItem.type == "GALLERY" &&
            this.signimagesarrayurls.length == 0
          ) {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: "Add atleast One Image",
              timeout: 5000,
              Top: true,
            };
          } else if (
            this.selectedItem.backend_type == "string" ||
            this.selectedItem.backend_type == "paragraph" ||
            this.selectedItem.backend_type == "number"
          ) {
            if (this.minvalue != "" && this.maxvalue != "") {
              if (Number(this.minvalue) < Number(this.maxvalue)) {
                this.formFields.push({
                  type: this.selectedItem.type,
                  label: this.labelToDisplay,
                  icon: this.selectedItem.icon,
                  backend_type: this.selectedItem.backend_type,
                  displayLabel: this.labelToDisplay,
                  is_displayed: true,
                  is_readonly: false,
                  is_required: this.madatoryField,
                  hide_on_creation: this.hideOncreation,
                  min_value: Number(this.minvalue),
                  max_value: Number(this.maxvalue),
                  fieldOptions:
                    this.selectedItem.type == "GALLERY"
                      ? this.signimagesarrayurls
                      : this.globalOptions,
                });
                this.componentCheck = false;
                this.minvalue = "1";
                this.maxvalue = "100";
                this.datetimevalidation = "past_future";
              } else {
                this.SnackBarComponent = {
                  SnackbarVmodel: true,
                  SnackbarColor: "red",
                  SnackbarText:
                    "The minimum value cannot be greater than the maximum value",
                  timeout: 5000,
                  Top: true,
                };
              }
            }
          } else if (this.selectedItem.backend_type == "date") {
            this.formFields.push({
              type: this.selectedItem.type,
              label: this.labelToDisplay,
              icon: this.selectedItem.icon,
              backend_type: this.selectedItem.backend_type,
              displayLabel: this.labelToDisplay,
              is_displayed: true,
              is_readonly: false,
              is_required: this.madatoryField,
              hide_on_creation: this.hideOncreation,
              date_valid: this.datetimevalidation,
              fieldOptions:
                this.selectedItem.type == "GALLERY"
                  ? this.signimagesarrayurls
                  : this.globalOptions,
            });
            this.componentCheck = false;
            this.datetimevalidation = "past_future";
          } else {
            this.formFields.push({
              type: this.selectedItem.type,
              label: this.labelToDisplay,
              icon: this.selectedItem.icon,
              backend_type: this.selectedItem.backend_type,
              displayLabel: this.labelToDisplay,
              is_displayed: true,
              is_readonly: false,
              is_required: this.madatoryField,
              hide_on_creation: this.hideOncreation,
              active_field_type:
                this.selectedItem.active_field_type != undefined
                  ? this.selectedItem.active_field_type
                  : undefined,
              fieldOptions:
                this.selectedItem.type == "GALLERY"
                  ? this.signimagesarrayurls
                  : this.globalOptions,
            });
            this.componentCheck = false;
          }
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "A label for the display already exists",
            timeout: 5000,
            Top: true,
          };
        }
      }
    },

    async get_edit_field(value) {
      // console.log("editvalue", value);
      this.selectedItem = {};
      this.labelToDisplay = "";
      this.componentCheck = true;
      this.selectedItem = value;
      this.showTitleCheck = 0;
      this.labelToDisplay = value.label;
      this.madatoryField = value.is_required;
      this.hideOncreation =
        value.hide_on_creation == undefined ? false : value.hide_on_creation;
      this.minvalue = value.min_value;
      this.maxvalue = value.max_value;
      this.datetimevalidation = value.date_valid;
      this.editable = true;
      if (value.type == "GALLERY") {
        this.signimagesarrayurls = value.fieldOptions;
        this.converteUrl = [];
        if (value.fieldOptions.length != 0) {
          const details = this.$store.getters.GetOrgDetails;
          for (let i = 0; i < value.fieldOptions.length; i++) {
            const signedUrl = await getS3SignedUrl(
              value.fieldOptions[i],
              details.s3_details
            );

            this.converteUrl.push(signedUrl);
          }
          this.converteUrl = [...new Set(this.converteUrl)];
        }
      } else {
        this.globalOptions = value.fieldOptions;
      }
    },

    get_edit_index(value) {
      if (value == 0) {
        this.showTitleCheck = 1;
      } else {
        this.showTitleCheck = 0;
      }
    },

    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    get_mandatory_value(value) {
      if (this.editable == true) {
        this.formFields.forEach((element) => {
          if (element.label == this.selectedItem.label) {
            element.is_required = value;
          }
        });
      }
    },

    get_hidden_value(value) {
      if (this.editable == true) {
        this.formFields.forEach((element) => {
          if (element.label == this.selectedItem.label) {
            element.hide_on_creation = value;
          }
        });
      }
    },

    // get_daterange_value(value) {
    //   // console.log(value);
    //   if (this.editable == true) {
    //     this.formFields.forEach((element) => {
    //       if (element.label == this.selectedItem.label) {
    //         if(value == 'pastDates'){

    //         }else if(value == 'futureDates'){

    //         }else if(value == 'currentDate'){

    //         }else if(value == 'any'){

    //         }
    //         // element.date_valid = value;
    //       }
    //     });
    //   }
    // },

    get_min_value(value) {
      if (this.editable == true) {
        this.formFields.forEach((element) => {
          if (element.label == this.selectedItem.label) {
            element.min_value = Number(value);
          }
        });
      }
    },

    get_max_value(value) {
      if (this.editable == true) {
        this.formFields.forEach((element) => {
          if (element.label == this.selectedItem.label) {
            element.max_value = Number(value);
          }
        });
      }
    },
    get_input_value(value) {
      if (this.editable == true) {
        this.formFields.forEach((element) => {
          if (element.label == this.selectedItem.label) {
            element.label = value;
            element.displayLabel = value;
          }
        });
      }
    },

    back_action() {
      this.componentCheck = false;
      this.labelToDisplay = "";
      this.minvalue = "1";
      this.maxvalue = "100";
      this.datetimevalidation = "past_future";
    },

    preview_action() {
      this.previewCheck = 2;
      this.previewDialog = true;
    },

    save_directory_form() {
      this.formDataArray = this.formFields;
      this.directoryFormDialog = true;
      this.previewCheck = 4;
    },

    save_actions() {
      this.formDataArray = this.formFields;
      this.previewCheck = 1;
      this.publishFormDialog = true;
    },

    async add_options(value) {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        if (!this.globalOptions.includes(value)) {
          this.globalOptions.push(value);
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "This Option already Exist",
            timeout: 5000,
            Top: true,
          };
        }
      }

      this.fieldData = "";
      this.$refs.form.reset();
    },

    delete_data(val) {
      this.globalOptions.splice(val, 1);
    },

    get_completeion() {
      setTimeout(() => {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "green",
          SnackbarText: "Form Designed Successfully",
          timeout: 5000,
          Top: true,
        };
        this.$router.push("/home/AdminFlowDesigner");
      }, 500);
    },

    directory_Success(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: "Form Designed Successfully",
        timeout: 5000,
        Top: true,
      };
      this.directoryFormDialog = false;

      this.$store.commit("SetDirectoryForm", true);
      this.$store.commit("SetformLibrary", false);

      this.$store.commit(
        "SetFormName",
        value.Directory_design_settings[0].directory_name
      );
      this.$store.commit("SetFormObj", value.Directory_design_settings[0]);
    },

    navigate_path() {
      this.$router.push("/home/FormDesignerAdmin");
    },

    back_call() {
      if (this.$store.getters.GetDirectoryForm == true) {
        this.$router.push("/home/DirectoryList");
      } else {
        // if (this.$store.getters.GetCustomFormDesign == true) {
        // }
        if (this.$store.getters.GetEditFormDetails.FormEdit == true) {
          this.$router.push({
            name: "FormDesignerAdmin",
            params: {
              formMethod: "Forms",
            },
          });
        } else {
          if (this.$store.getters.GetFormLibrary == false) {
            // console.log(
            //   this.$store.getters.GetFormObject,
            //   this.$store.getters.GetFormType
            // );
            this.create_form();
          } else {
            this.$router.push({
              name: "FormDesignerAdmin",
              params: {
                formMethod: "Forms",
              },
            });
          }
        }
      }
    },
    async create_form() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(draft_custom_form, {
            input: {
              organization_id: data.organization.organization_id,
              form_id: this.$store.getters.GetFormObject.form_id,
              form_design_template: JSON.stringify(this.formFields),
              is_form_designed: true,
              enum_type: this.$store.getters.GetFormType,
              user_email_id: data.user.user_email_id,
            },
          })
        );
        var response = JSON.parse(result.data.draft_custom_form);
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.$router.push({
            name: "FormDesignerAdmin",
            params: {
              formMethod: "Forms",
            },
          });
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        // console.log(error);
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    async save_visit_form() {
      this.loadingvist = true;
      var data = this.$store.getters.GetUserObj;
      var visitdata = this.$store.getters.Getvisitdetails;
      try {
        let result = await API.graphql(
          graphqlOperation(Visit_type_creation, {
            input: {
              user_email_id: data.user.user_email_id,
              visit_type_name: visitdata.visit_type_name,
              visit_type_frequency: visitdata.visit_type_frequency,
              visit_type_representation: visitdata.visit_type_representation,
              scan_tolerance: visitdata.scan_tolerance,
              adhock_approval_required: visitdata.adhock_approval_required,
              form_design_template: JSON.stringify(this.formFields),
            },
          })
        );

        this.loadingvist = false;

        var response = JSON.parse(result.data.Visit_type_creation);
        this.loadingvist = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$store.commit("Setvisitdetails", {});
          this.$store.commit("SetVisitorFormEnabled", false);
          this.$store.commit("SetVisitorFormEdit", false);
          this.formFields = [];
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loadingvist = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    async edit_visit_form() {
      this.loadingvist = true;

      var visitdata = this.$store.getters.Getvisitdetails;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_visittype_form, {
            input: {
              visit_type_id: visitdata.visit_type_id,
              form_design_template: JSON.stringify(this.formFields),
            },
          })
        );

        this.loadingvist = false;

        var response = JSON.parse(result.data.edit_visittype_form);
        this.loadingvist = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("successMsg", "Form Updated Successfully");
          this.$store.commit("Setvisitdetails", {});
          this.$store.commit("SetVisitorFormEnabled", false);
          this.$store.commit("SetVisitorFormEdit", false);
          this.formFields = [];
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loadingvist = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    async GetvisitForm() {
      var data = this.$store.getters.GetUserObj;
      var visitdata = this.$store.getters.Getvisitdetails;
      try {
        let result = await API.graphql(
          graphqlOperation(get_visit_type_form, {
            input: {
              organization_id: data.organization.organization_id,
              visit_type_id: visitdata.form_id,
            },
          })
        );

        var response = JSON.parse(result.data.get_visit_type_form);
        this.formFields = [];
        if (response.Status == "SUCCESS") {
          this.formFields = response.form[0].form_design_template;
        } else {
          this.formFields = [];
        }
      } catch (error) {
        this.formFields = [];
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
<style scoped>
.card-content {
  overflow: auto; /* Add overflow property to handle content overflow */
}
.text-left {
  text-align: left;
}
</style>


<!-- <template>
  <div>
    <v-toolbar class="mt-4 bg-white" density="compact" flat>
      <v-toolbar-title
        v-if="
          $store.getters.GetFormLibrary == false &&
          $store.getters.GetVisitorFormEnabled == false &&
          $store.getters.GetVisitorFormEdit == false
        "
      >
        Design Form for {{ $store.getters.GetFormName }}
      </v-toolbar-title>
      <v-spacer />
      <v-btn
        v-if="$store.getters.GetFormLibrary == false"
        dark
        :disabled="formFields.length == 0"
        @click="preview_action()"
        class="text-capitalize cardCss text-white"
        >Preview</v-btn
      >
      <v-btn
        v-if="
          $store.getters.GetDirectoryForm == true &&
          $store.getters.GetFormLibrary == false
        "
        dark
        :disabled="formFields.length == 0"
        @click="save_directory_form()"
        class="text-capitalize ml-2 cardCss text-white"
        >Save</v-btn
      >
      <v-btn
        dark
        :disabled="formFields.length == 0"
        @click="save_visit_form()"
        v-if="$store.getters.GetVisitorFormEnabled == true"
        :loading="loadingvist"
        class="text-capitalize ml-2 cardCss text-white"
        >Save
      </v-btn>
      <v-btn
        dark
        :disabled="formFields.length == 0"
        @click="edit_visit_form()"
        v-if="$store.getters.GetVisitorFormEdit == true"
        :loading="loadingvist"
        class="text-capitalize ml-2 cardCss text-white"
        >Save
      </v-btn>

      <v-btn
        v-if="
          $store.getters.GetFormLibrary == false &&
          $store.getters.GetDirectoryForm == false &&
          $store.getters.GetVisitorFormEnabled == false &&
          $store.getters.GetVisitorFormEdit == false
        "
        dark
        :disabled="formFields.length == 0"
        @click="save_actions()"
        class="text-capitalize ml-2 cardCss text-white"
        >Save</v-btn
      >
      <v-btn
        v-show="
          $store.getters.GetDirectoryForm == false &&
          $store.getters.GetVisitorFormEnabled == false &&
          $store.getters.GetVisitorFormEdit == false
        "
        dark
        class="text-capitalize cardCss ml-2 text-white"
        @click="back_call()"
      >
        <v-icon class="mr-2">mdi-step-backward</v-icon>
        Back
      </v-btn>
    </v-toolbar>
    <v-card class="ma-2 mt-3" flat>
      <v-row>
        <v-col
          cols="12"
          sm="12"
          md="8"
          xs="12"
          lg="7"
          v-if="$store.getters.GetFormLibrary == true"
          fill-height
        >
          <OverlayComp :overlay="overlay" />
          <v-card
            :loading="loading1"
            v-if="componentCheck == false"
            :height="cardHeight"
            over
            variant="outlined"
            class="card-content"
          >
            <v-list density="compact">
              <v-list-subheader class=""
                ><h2>Form Library</h2></v-list-subheader
              >
              <v-divider />
              <template v-for="(item, i) in items" :key="i">
                <v-list-item
                  @click="get_selected_form_item(item, i)"
                  density="compact"
                  color="primary"
                >
                  <v-list-item-title style="font-size: 15px">
                    <b>{{ item.form_name }}</b></v-list-item-title
                  >
                  <v-list-item-subtitle
                    class="text-left"
                    v-html="item.form_description"
                  ></v-list-item-subtitle>
                  <v-list-item-action
                    v-if="
                      formCheck == true &&
                      item.form_name == selectedFormValue.form_name
                    "
                    class="justify-end mt-n8"
                  >
                    <v-btn
                      size="x-small"
                      @click="use_template(item)"
                      color="primary"
                    >
                      Use Template
                    </v-btn>
                  </v-list-item-action>
                </v-list-item>
                <v-divider
                  v-if="i < items.length - 1"
                  :key="item.form_name"
                ></v-divider>
              </template>
            </v-list>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          sm="12"
          md="7"
          xs="4"
          v-if="$store.getters.GetFormLibrary == false"
          fill-height
        >
          <v-card
            v-if="componentCheck == false"
            variant="outlined"
            flat
            :height="cardHeight"
            over
            class="card-content"
          >
            <v-toolbar flat class="bg-white">
              <v-tabs v-model="tabs" align-tabs="center">
                <v-tab class="text-primary ml-6 text-capitalize">
                  Input Fields
                </v-tab>
                <v-tab class="text-primary ml-6 text-capitalize"
                  >Display Fields
                </v-tab>
                <v-tab
                  class="text-primary ml-6 text-capitalize"
                  v-if="formType == 'DEFAULT'"
                  >System Fields
                </v-tab>
                <v-tab class="text-primary ml-10 text-capitalize">Media </v-tab>
              </v-tabs>
            </v-toolbar>
            <v-tabs-window v-model="tabs" class="mr-4">
              <v-tabs-window-item>
                <v-row no-gutters>
                  <v-col
                    v-for="item in inputFields"
                    class="mt-1 pa-1 text-right"
                    :key="item.type"
                    cols="4"
                  >
                    <v-btn
                      shaped
                      block
                      class="ma-2"
                      @click="fetch_selected_item(item)"
                    >
                      <v-row justify="start">
                        <v-icon left small>{{ item.icon }}</v-icon>
                        <div class="text-left" style="font-size: small">
                          {{ item.label }}
                        </div>
                      </v-row>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-tabs-window-item>

              <v-tabs-window-item>
                <v-row no-gutters>
                  <v-col
                    v-for="item in displayFields"
                    class="mt-1 pa-1 text-right"
                    :key="item.type"
                    cols="4"
                  >
                    <v-btn
                      shaped
                      block
                      class="ma-2"
                      @click="fetch_selected_item(item)"
                    >
                      <v-row justify="start">
                        <v-icon left small>{{ item.icon }}</v-icon>
                        <div class="text-left" style="font-size: small">
                          {{ item.label }}
                        </div>
                      </v-row>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-tabs-window-item>

              <v-tabs-window-item v-if="formType == 'DEFAULT'">
                <v-row no-gutters>
                  <v-col
                    v-for="item in activeFields"
                    class="mt-1 pa-1 text-right"
                    :key="item.type"
                    cols="4"
                  >
                    <v-btn
                      shaped
                      block
                      class="ma-2"
                      @click="fetch_selected_item(item)"
                    >
                      <v-row justify="start">
                        <v-icon left small>{{ item.icon }}</v-icon>
                        <div class="text-left" style="font-size: small">
                          {{ item.label }}
                        </div>
                      </v-row>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-tabs-window-item>

              <v-tabs-window-item>
                <v-row no-gutters>
                  <v-col
                    v-for="item in mediaFields"
                    class="mt-1 pa-1 text-right"
                    :key="item.type"
                    cols="4"
                  >
                    <v-btn
                      shaped
                      block
                      class="ma-2"
                      @click="fetch_selected_item(item)"
                    >
                      <v-row justify="start">
                        <v-icon left small>{{ item.icon }}</v-icon>
                        <div class="text-left" style="font-size: small">
                          {{ item.label }}
                        </div>
                      </v-row>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-tabs-window-item>

              <v-tabs-window-item>
                <v-row no-gutters>
                  <v-col
                    v-for="item in compositeFields"
                    class="mt-1 pa-1 text-right"
                    :key="item.type"
                    cols="4"
                  >
                    <v-btn
                      shaped
                      block
                      class="ma-2"
                      @click="fetch_selected_item(item)"
                    >
                      <v-row justify="start">
                        <v-icon left small>{{ item.icon }}</v-icon>
                        <div class="text-left" style="font-size: small">
                          {{ item.label }}
                        </div>
                      </v-row>
                    </v-btn>
                  </v-col>
                </v-row>
              </v-tabs-window-item>
            </v-tabs-window>
          </v-card>
          <v-card
            flat
            over
            :height="cardHeight"
            class="card-content"
            variant="outlined"
            v-if="componentCheck == true"
          >
            <v-card-title class="justify-center">
              <v-row>
                <v-col cols="12" sm="10"> Edit Field </v-col>
                <v-col cols="12" sm="2" class="justify-end">
                  <v-btn
                    size="small"
                    class="cardCss text-white"
                    @click="back_action()"
                    >back</v-btn
                  >
                </v-col>
              </v-row>
            </v-card-title>

            <v-card-text>
              <v-form ref="formlabel">
                <v-select
                  density="compact"
                  v-show="
                    showTitleCheck == 1 &&
                    $store.getters.GetDirectoryForm == true &&
                    $store.getters.GetFormObject.is_directory_designed == false
                  "
                  v-model="selectdirectoryFieldType"
                  label="Field Type"
                  :items="[
                    { label: 'TEXTFIELD', value: 'TEXTFIELD' },
                    { label: 'DATE', value: 'DATE' },
                    { label: 'NUMBER', value: 'NUMBER' },
                    { label: 'Date and Time', value: 'DATETIME' },
                  ]"
                  item-text="label"
                  item-value="value"
                  @input="rearrange_form_type(selectdirectoryFieldType)"
                  variant="outlined"
                />

                <v-text-field
                  v-show="
                    showTitleCheck == 0 &&
                    $store.getters.GetDirectoryForm == true
                  "
                  density="compact"
                  readonly
                  v-model="selectedItem.type"
                  label="Field Type"
                  variant="outlined"
                />
                <v-text-field
                  v-show="$store.getters.GetDirectoryForm == false"
                  density="compact"
                  readonly
                  v-model="selectedItem.type"
                  label="Field Type"
                  variant="outlined"
                />

                <v-textarea
                  density="compact"
                  :readonly="
                    showTitleCheck === 1 &&
                    $store.getters.GetDirectoryForm &&
                    $store.getters.GetFormObject.is_directory_designed
                  "
                  row-height="10"
                  rows="1"
                  auto-grow
                  :rules="[(v) => !!v || 'Required']"
                  variant="outlined"
                  v-model="labelToDisplay"
                  label="Label To Display"
                  @input="get_input_value(labelToDisplay)"
                />
              </v-form>

              <v-checkbox
                v-if="
                  selectedItem.backend_type != 'label' &&
                  selectedItem.backend_type != 'gallery' &&
                  selectedItem.backend_type != 'rating' &&
                  selectedItem.backend_type != 'boolean'
                "
                class="mt-n1"
                v-model="madatoryField"
                :readonly="showTitleCheck == 1"
                label="Mandatory Field*"
                @change="get_mandatory_value(madatoryField)"
              ></v-checkbox>

              <v-checkbox
                v-show="
                  showTitleCheck == 0 &&
                  $store.getters.GetDirectoryForm == true &&
                  $store.getters.GetExternalForm == true
                "
                class="mt-n1"
                v-model="hideOncreation"
                label="Hide On Initial Submission"
                @change="get_hidden_value(hideOncreation)"
              ></v-checkbox>

              <div
                v-if="
                  selectedItem.backend_type == 'string' ||
                  selectedItem.backend_type == 'paragraph' ||
                  selectedItem.backend_type == 'number' ||
                  selectedItem.backend_type == 'time' ||
                  selectedItem.backend_type == 'date'
                "
              >
                <v-row>
                  <v-col cols="6">
                    <v-text-field
                      variant="outlined"
                      :rules="[(v) => !!v || 'Required']"
                      density="compact"
                      @keypress="is_number($event)"
                      v-on:paste="process($event)"
                      v-model="minvalue"
                      v-if="
                        selectedItem.backend_type != 'time' &&
                        selectedItem.backend_type != 'date'
                      "
                      :label="
                        selectedItem.backend_type === 'number'
                          ? 'Min value'
                          : 'Minimum Characters'
                      "
                      style="width: 250px"
                      @change="get_min_value(minvalue)"
                    />
                  </v-col>

                  <v-col cols="6">
                    <v-text-field
                      variant="outlined"
                      :rules="[(v) => !!v || 'Required']"
                      @keypress="is_number($event)"
                      v-on:paste="process($event)"
                      density="compact"
                      v-model="maxvalue"
                      v-if="
                        selectedItem.backend_type != 'time' &&
                        selectedItem.backend_type != 'date'
                      "
                      :label="
                        selectedItem.backend_type === 'number'
                          ? 'Max value'
                          : 'Maximum Characters'
                      "
                      style="width: 250px"
                      @change="get_max_value(maxvalue)"
                    />
                  </v-col>
                </v-row>
              </div>
              <div v-if="selectedItem.type == 'DROPDOWN'">
                <v-form ref="form">
                  <v-row no-gutters>
                    <v-col>
                      <v-text-field
                        variant="outlined"
                        density="compact"
                        v-model="fieldData"
                        :rules="[
                          (v) => (v && v.trim().length > 0) || 'Required',
                        ]"
                        label="Options"
                        style="width: 250px"
                      />
                    </v-col>
                    <v-col>
                      <v-btn
                        @click="add_options(fieldData)"
                        class="elevation-0 ml-2"
                        fab
                        x-small
                      >
                        <v-icon dark> mdi-plus </v-icon>
                      </v-btn>
                    </v-col>
                    <v-col>
                      <UploadExcel
                        :on-success="handleSuccess"
                        :before-upload="beforeUpload"
                      />
                    </v-col>
                    <v-col v-if="globalOptions.length > 0">
                      <v-btn
                        color="error"
                        @click="showDeleteAllDialog = true"
                        class="elevation-0"
                        small
                      >
                        <v-icon left>mdi-delete</v-icon>
                        Delete All
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-form>

                <v-chip-group column>
                  <v-chip
                    v-for="(item, index) in globalOptions"
                    :key="index"
                    closable
                    :close="globalOptions.length > 1"
                    @click:close="
                      globalOptions.length > 1 ? delete_data(index) : null
                    "
                  >
                    {{ item }}
                  </v-chip>
                </v-chip-group>
              </div>
              <div v-if="selectedItem.type == 'GALLERY'">
                <v-toolbar density="compact" class="rounded elevation-1 pa-2"
                  ><b> Add Image</b> <v-spacer />
                  <input
                    type="file"
                    ref="fileInput"
                    @change="handleFileChange"
                    style="display: none"
                    accept="image/*"
                  />
                  <v-btn
                    v-show="signimagesarrayurls.length < 5"
                    dark
                    class="text-capitalize cardCss text-white"
                    @click="$refs.fileInput.click()"
                    small
                    :loading="uploadload"
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                </v-toolbar>
                <v-card flat class="overflow-auto overflow-x-hidden ma-2">
                  <v-card
                    class="ma-8"
                    flat
                    v-for="(signimagesarrayurls, index) in converteUrl"
                    :key="index"
                  >
                    <v-row>
                      <v-col cols="6">
                        <v-img
                          max-height="100"
                          contain
                          :src="signimagesarrayurls"
                          v-if="signimagesarrayurls.length > 1"
                        >
                        </v-img>
                      </v-col>
                      <v-col cols="2">
                        <v-btn
                          icon
                          class="mt-4"
                          @click="delete_item(signimagesarrayurls, index)"
                        >
                          <v-icon color="red">mdi-delete</v-icon>
                        </v-btn>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-card>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn
                class="text-capitalize cardCss text-white"
                dark
                v-if="editable == false"
                @click="add_field()"
                style="width: 250px"
                >Add Field</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" sm="12" md="5" xs="12">
          <AdminFormView
            :key="refreshComp"
            :formFields="formFields"
            v-on:editValue="get_edit_field"
            v-on:editIndex="get_edit_index"
          />
        </v-col>
      </v-row>

      <div v-if="previewCheck == 1">
        <FormPusblishDialog
          :publishFormDialog="publishFormDialog"
          :formDataArray="formDataArray"
          v-on:errorMsg="error_info"
          v-on:successMsg="get_completeion"
          v-on:onPublish="navigate_path"
          @clicked="publishFormDialog = false"
        />
      </div>
      <div v-if="previewCheck == 2">
        <FormPreview
          :previewDialog="previewDialog"
          :formFields="formFields"
          @clicked="previewDialog = false"
        />
      </div>
      <div v-if="previewCheck == 3">
        <DropdownUpload
          :dropExceldailog="dropExceldailog"
          @clicked="dropExceldailog = false"
          :excelHeaders="excelHeaders"
          :excelTableData="excelTableData"
          @dropdown="updateitems"
        />
      </div>
      <div v-if="previewCheck == 4">
        <DirectoryFormSave
          :directoryFormDialog="directoryFormDialog"
          :formDataArray="formDataArray"
          v-on:successMsg="directory_Success"
          @clicked="directoryFormDialog = false"
        />
      </div>
    </v-card>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    
    <v-dialog v-model="showDeleteAllDialog" max-width="400">
      <v-card>
        <v-card-title class="headline">
          Confirm Delete All
        </v-card-title>
        <v-card-text>
          Are you sure you want to delete all options? This action cannot be undone.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="grey"
            text
            @click="showDeleteAllDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            text
            @click="clearAllOptions"
          >
            Delete All
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { API, graphqlOperation, Auth } from "aws-amplify";
import { deleteS3SignedUrl } from "@/mixins/S3DeleteStorageFile";
import { uploadToS3 } from "@/mixins/S3PutStorageFile.js";
import { getS3SignedUrl } from "@/mixins/S3GetStorageFile.js";
import {
  draft_custom_form,
  Visit_type_creation,
  edit_visittype_form,
} from "@/graphql/mutations.js";
import { get_visit_type_form } from "@/graphql/queries.js";
import * as XLSX from "xlsx";
import CountryList from "@/JsonFiles/CountryList.json";
import DropdownUpload from "@/components/FormDesigner/FormDialogs/DropdownUpload.vue";
import AdminFormView from "@/components/FormDesigner/AdminFormView.vue";
import FormPreview from "@/components/FormDesigner/FormDialogs/FormPreview.vue";
import FormPusblishDialog from "@/components/FormDesigner/FormDialogs/FormPusblishDialog.vue";
import DirectoryFormSave from "@/components/LookitUPDirectiory/AllDialogs/DirectoryFormSave.vue";
import { get_all_from_libraries } from "@/mixins/GetFormLibrary.js";
import UploadExcel from "@/components/UploadExcel/IndexList.vue";
import OverlayComp from "@/components/OverlayComp.vue";
var AWS = require("aws-sdk");
import { Buffer } from "buffer";
import SnackBar from "@/components/SnackBar.vue";
export default {
  components: {
    AdminFormView,
    FormPreview,
    FormPusblishDialog,
    OverlayComp,
    SnackBar,
    DropdownUpload,
    UploadExcel,
    CountryList,
    DirectoryFormSave,
  },
  mixins: [get_all_from_libraries],
  data() {
    return {
      SnackBarComponent: {},
      formAction: "",
      minvalue: "1",
      datetimevalidation: "past_future",
      formType: "DEFAULT",
      maxvalue: "100",
      dropExceldailog: false,
      panel: [0],
      tabs: 0,
      refreshComp: 0,
      selectdirectoryFieldType: "TEXTFIELD",
      inputFields: [
        {
          type: "TEXTFIELD",
          icon: "mdi-text-recognition",
          label: "Text",
          backend_type: "string",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "PARAGRAPH",
          icon: "mdi-text-box",
          label: "Paragraph",
          backend_type: "paragraph",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "NUMBER",
          icon: "mdi-numeric",
          label: "Number",
          backend_type: "number",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "MOBILENUMBER",
          icon: "mdi-phone",
          label: "Mobile Number",
          backend_type: "phonenumber",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "EMAIL",
          icon: "mdi-email",
          label: "Email",
          backend_type: "email",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "DROPDOWN",
          icon: "mdi-format-list-bulleted-square",
          label: "Dropdown",
          backend_type: "single_choice",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "CHECKBOX",
          icon: "mdi-checkbox-outline",
          label: "Checkbox",
          backend_type: "checkbox",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "TIME",
          icon: "mdi-timer",
          label: "Time",
          backend_type: "time",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "DATE",
          icon: "mdi-calendar",
          label: "Date",
          backend_type: "date",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "NAME",
          icon: "mdi-account",
          label: "Name",
          backend_type: "string",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },

        {
          type: "FLIPSWITCH",
          icon: "mdi-toggle-switch",
          label: "Flip Switch",
          backend_type: "boolean",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },

        {
          type: "RATING",
          icon: "mdi-star-outline",
          label: "Ratings",
          backend_type: "rating",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },

        {
          type: "URL",
          icon: "mdi-link",
          label: "URL",
          backend_type: "url",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },

        {
          type: "YOUTUBE",
          icon: "mdi-youtube",
          label: "Youtube",
          backend_type: "youtube",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },

        {
          type: "COUNTRYLIST",
          icon: "mdi-earth",
          label: "Country List",
          active_field_type: "country_list",
          backend_type: "single_choice",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },

        {
          type: "DATETIME",
          icon: "mdi-earth",
          label: "Date and Time",
          backend_type: "datetime",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },

        {
          type: "YEAR",
          icon: "mdi-calendar-today",
          label: "Year",
          backend_type: "year",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
      ],
      displayFields: [
        {
          type: "LABEL",
          icon: "mdi-label",
          label: "Label",
          backend_type: "label",
          is_displayed: true,
          is_readonly: false,
          is_required: false,
          hide_on_creation: false,
        },
        {
          type: "GALLERY",
          icon: "mdi-image-outline",
          label: "Image",
          backend_type: "gallery",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
      ],
      mediaFields: [
        {
          type: "MEDIA",
          icon: "mdi-camera",
          label: "Media",
          backend_type: "media",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
      ],
      activeFields: [
        {
          type: "TEAMLIST",
          icon: "mdi-account-group",
          label: "Teams",
          active_field_type: "team_list",
          backend_type: "single_choice",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "GROUPLIST",
          icon: "mdi-group",
          label: "Groups",
          active_field_type: "group_list",
          backend_type: "single_choice",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "LOCATIONLIST",
          icon: "mdi-map-marker-multiple",
          label: "Locations",
          active_field_type: "location_list",
          backend_type: "single_choice",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "DESIGNATIONLIST",
          icon: "mdi-mail",
          label: "Designations",
          backend_type: "single_choice",
          active_field_type: "designation_list",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "CUSTOMERSLIST",
          icon: "mdi-mail",
          label: "Customers",
          backend_type: "single_choice",
          active_field_type: "list_all_customers",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "PRODUCTSLIST",
          icon: "mdi-mail",
          label: "Products/Services",
          backend_type: "single_choice",
          active_field_type: "list_all_sub_categories",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "VENDORSLIST",
          icon: "mdi-mail",
          label: "Suppliers/Vendors",
          backend_type: "single_choice",
          active_field_type: "list_asset_supliers",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
        {
          type: "MULTICHOICE",
          icon: "mdi-account-multiple",
          label: "Multiple User Picker",
          backend_type: "multi_choice",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
      ],
      compositeFields: [
        {
          type: "CountryStateList",
          icon: "mdi-earth",
          label: "Country and State List",
          backend_type: "countrystatelist",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          hide_on_creation: false,
        },
      ],
      cardHeight: 0,
      componentCheck: false,
      selectedItem: {},
      loadingvist: false,
      labelToDisplay: "",
      formFields: [],
      count: 0,
      fieldData: "",
      globalOptions: [],
      displayOption: 0,
      madatoryField: false,
      editable: true,
      previewCheck: 0,
      previewDialog: false,
      showDeleteAllDialog: false,
      uploadload: false,
      publishFormDialog: false,
      formDataArray: [],
      items: [],
      excelHeaders: [],
      formCheck: false,
      selectedFormValue: {},
      loading1: false,
      overlay: false,
      regularS3URLsnew: [],
      arrayurls: [],
      signimagesarrayurls: [],
      converteUrl: [],
      excelTableData: [],
      directoryFormDialog: false,
      fieldChangeChecck: false,
      showTitleCheck: 0,
      hideOncreation: false,
    };
  },
  computed: {
    shouldShowSelect() {
      return (
        this.formFields.length === 1 &&
        this.$store.getters.GetDirectoryForm === true
      );
    },
  },
  async mounted() {
    if (this.$store.getters.GetEditFormDetails.FlowValue == undefined) {
      this.formType = "DEFAULT";
    } else {
      this.formType =
        this.$store.getters.GetEditFormDetails.FlowValue.workflow_design_type ==
        undefined
          ? "DEFAULT"
          : this.$store.getters.GetEditFormDetails.FlowValue
              .workflow_design_type;
    }

    this.formFields = [];
    this.fieldChangeChecck = false;
    var formData = this.$store.getters.GetFormObject;

    if (
      this.$store.getters.GetDirectoryForm == false &&
      formData.is_form_designed == true
    ) {
      this.formFields = formData.form_design_template;
    }

    if (
      this.$store.getters.GetDirectoryForm == true &&
      formData.is_directory_designed == true
    ) {
      this.formFields = formData.directory_design_template;
    }
    if (
      this.$store.getters.GetCustomFormDesign == true ||
      (this.$store.getters.GetDirectoryForm == true &&
        formData.is_directory_designed == false)
    ) {
      var data = [
        {
          backend_type: "string",
          displayLabel: "Title",
          fieldOptions: [],
          icon: "mdi-text-recognition",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          label: "Title",
          max_value: 100,
          min_value: 1,
          type: "TEXTFIELD",
          hide_on_creation: false,
        },
      ];
      this.fieldChangeChecck = true;
      this.formFields = data;
    }

    if (this.$store.getters.GetFormLibrary == true) {
      this.overlay = true;
      this.formFields = [];
      await this.get_all_from_libraries();
      this.overlay = false;
      this.items = [];
      var formarray = [];
      formarray = this.globalForms;
      var dataform = this.$store.getters.Getlibraryformtype;
      if (dataform == "FORM_LIBRARY") {
        this.items = formarray.filter(
          (form) => form.form_type === "FORM_LIBRARY"
        );
      } else if (dataform === "DIRECTORY_FORM_LIBRARY") {
        this.items = formarray.filter(
          (form) => form.form_type === "DIRECTORY_FORM_LIBRARY"
        );
      } else if (dataform === "") {
        this.items = formarray;
      }
    }
    this.cardHeight = window.innerHeight - 171;
    if (this.$store.getters.GetVisitorFormEdit == true) {
      this.formFields = [];
      this.GetvisitForm();
    }
  },

  methods: {
    downloadExcel() {
      const workbook = XLSX.utils.book_new();
      const worksheetData = this.globalOptions.map((option) => [option]);
      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      XLSX.utils.book_append_sheet(workbook, worksheet, "GlobalOptions");
      XLSX.writeFile(workbook, "globalOptions.xlsx");
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

    async rearrange_form_type(value) {
      var data = {};
      this.selectedItem = {};
      this.refreshComp = 0;
      this.formFields[0] = {};
      this.fieldChangeChecck = true;
      if (value == "NUMBER") {
        data = {
          type: "NUMBER",
          icon: "mdi-numeric",
          label: "Number",
          backend_type: "number",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          displayLabel: "Number",
          max_value: 10000000,
          min_value: 0,
          fieldOptions: [],
          hide_on_creation: false,
        };

        this.labelToDisplay = "Number";
        this.minvalue = 0;
        this.maxvalue = 10000000;
      } else if (value == "DATE") {
        data = {
          type: "DATE",
          icon: "mdi-calendar",
          label: "Date",
          backend_type: "date",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          displayLabel: "Date",
          hide_on_creation: false,
          fieldOptions: [],
        };

        this.labelToDisplay = "Date";
      } else if (value == "TEXTFIELD") {
        data = {
          backend_type: "string",
          displayLabel: "Title",
          fieldOptions: [],
          icon: "mdi-text-recognition",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          label: "Title",
          max_value: 100,
          min_value: 1,
          type: "TEXTFIELD",
          hide_on_creation: false,
        };
        this.labelToDisplay = "Title";
      } else if (value == "DATETIME") {
        data = {
          type: "DATETIME",
          icon: "mdi-earth",
          label: "Date and Time",
          backend_type: "datetime",
          is_displayed: true,
          is_readonly: false,
          is_required: true,
          displayLabel: "Date and Time",
          fieldOptions: [],
          hide_on_creation: false,
        };

        this.labelToDisplay = "Date and Time";
      }
      this.selectedItem = data;

      await this.add_title_filed(data);
      this.refreshComp++;
    },

    add_title_filed(value) {
      this.formFields[0] = value;
      this.refreshComp++;
    },

    fetch_selected_item(value) {
      if (value.type == "PARAGRAPH") {
        this.minvalue = 1;
        this.maxvalue = 1000;
      }
      if (value.type == "NUMBER") {
        this.minvalue = 0;
        this.maxvalue = 10000000;
      }
      this.fieldChangeChecck = false;
      this.selectedItem = {};
      this.labelToDisplay = "";
      this.componentCheck = true;
      this.selectedItem = value;
      this.labelToDisplay = value.label;
      this.madatoryField = false;
      this.hideOncreation = false;
      this.globalOptions = [];
      this.signimagesarrayurls = [];
      this.converteUrl = [];
      this.editable = false;
      this.showTitleCheck = 0;
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

    updateitems(val) {
      this.dropExceldailog = false;
      const array = val;
      const uniqueItems = new Set();
      array.forEach((item) => {
        uniqueItems.add(item.dropdownitems);
      });
      const finalArray = Array.from(uniqueItems);
      const mergedOptions = [...new Set([...this.globalOptions, ...finalArray])];

      if (this.editable) {
        // Keep reference for existing field options so bound UI updates
        this.globalOptions.splice(0, this.globalOptions.length, ...mergedOptions);
        this.formFields.forEach((element) => {
          if (element.label === this.selectedItem.label) {
            element.fieldOptions = this.globalOptions;
          }
        });
      } else {
        this.globalOptions = mergedOptions;
      }
    },

    beforeUpload(file) {
      const isLt1M = file.size / 1024 / 1024 < 1;
      if (isLt1M) {
        return true;
      }
      this.$message({
        message: "Please do not upload files larger than 1m in size.",
        type: "warning",
      });
      return false;
    },
    handleSuccess({ results, header }) {
      this.excelTableData = results;

      this.excelHeaders = header;
      this.previewCheck = 3;
      this.dropExceldailog = true;
    },
    async handleFileChange(event) {
      const files = event.target.files[0];
      if (!files) {
        return;
      }
      await Auth.currentCredentials();
      const orgDetails = this.$store.getters.GetOrgDetails;

      const userId = this.$store.getters.GetUserObj.user?.user_id;

      const key =
        "workflow" +
        "/" +
        orgDetails.organization.organization_id +
        "/" +
        userId +
        "/" +
        Date.now() +
        "/" +
        this.replaceSpecialCharacters(files.name);
      try {
        const fileUrl = await uploadToS3(files, orgDetails.s3_details, key);
        if (fileUrl) {
          this.signimagesarrayurls.push(fileUrl);
          const details = this.$store.getters.GetOrgDetails;
          const signedUrl = await getS3SignedUrl(fileUrl, details.s3_details);
          if (signedUrl) {
            this.converteUrl.push(signedUrl);
            this.contentdocumentFiles = [];
            this.refreshComp++;
          }
        }
      } catch (err) {}
    },
    s3convert(urls) {
      var response = this.$store.getters.GetOrgDetails;
      var s3Bucket = new AWS.S3({
        region: response.s3_details.region,
        accessKeyId: response.s3_details.access_key,
        secretAccessKey: response.s3_details.secret_key,
        signatureVersion: "v4",
      });
      var params = {
        Bucket: response.s3_details.bucket_name,
        Key: "workflow/" + urls.split("workflow/")[1],
        Expires: 60000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);

      return url;
    },
    isPresignedUrl(url) {
      return url.includes("X-Amz-Signature");
    },
    async upload_S3(files) {
      this.uploadload = true;
      var imageUrl = [];
      var newUrl = [];
      var baseData = [];
      var file = files;
      const fr = new FileReader();
      fr.readAsDataURL(file);
      fr.addEventListener("load", () => {
        imageUrl = fr.result;
        newUrl = imageUrl;
        newUrl = imageUrl.replace("data:" + file.type + ";base64,", "");
        baseData.push(newUrl);
        this.upload_S3_bucket(baseData[0], file);
      });
    },
    replaceSpecialCharacters(key) {
      return key.replace(/[^a-zA-Z0-9.]+/g, "");
    },

    async upload_S3_bucket(baseData, file) {
      var self = this;
      var deatils = self.$store.getters.GetOrgDetails;
      var buf = Buffer.from(baseData, "base64");
      var s3Bucket = new AWS.S3({
        region: deatils.s3_details.region,
        accessKeyId: deatils.s3_details.access_key,
        secretAccessKey: deatils.s3_details.secret_key,
      });
      var bucketName = deatils.s3_details.bucket_name;
      var params = {
        Bucket: bucketName,
        Key:
          "workflow" +
          "/" +
          deatils.organization.organization_id +
          "/" +
          self.$store.getters.GetUserObj.user?.user_id +
          "/" +
          Date.now() +
          "/" +
          self.replaceSpecialCharacters(file.name),

        Body: buf,
        ContentType: file.type,
      };
      var bucketurl =
        "https://" +
        bucketName +
        ".s3." +
        deatils.s3_details.region +
        ".amazonaws.com/" +
        params.Key;

      await s3Bucket.putObject(params, function (err, data) {
        if (err) {
          this.loading1 = false;
        } else if (data) {
          bucketurl;
          var deatil = self.$store.getters.GetOrgDetails;
          self.urls = bucketurl;
          self.s3get(deatil);
        }

        self.contentdocumentFiles = [];
      });
      this.uploadload = false;
    },

    async delete_item(val, index) {
      try {
        const matchedurl = this.signimagesarrayurls.find((url) =>
          val.includes(url)
        );

        const baseIndex =
          matchedurl.indexOf("amazonaws.com/") + "amazonaws.com/".length;
        const key = matchedurl.substring(baseIndex);

        const result = await deleteS3SignedUrl(key);
        if (result) {
          this.signimagesarrayurls.splice(index, 1);
          this.converteUrl.splice(index, 1);
          this.refreshComp++;
        }
      } catch (err) {
        console.error("Delete error:", err);
      }
    },
    s3get(response) {
      var s3Bucket = new AWS.S3({
        region: response.s3_details.region,
        accessKeyId: response.s3_details.access_key,
        secretAccessKey: response.s3_details.secret_key,
        signatureVersion: "v4",
      });
      var params = {
        Bucket: response.s3_details.bucket_name,
        Key: "workflow/" + this.urls.split("workflow/")[1],
        Expires: 60000 * 5,
      };
      var url = s3Bucket.getSignedUrl("getObject", params);
      this.signimagesarrayurls.unshift(url);
    },

    get_selected_form_item(item) {
      this.formCheck = true;
      this.selectedFormValue = item;
      this.formFields = item.form_design_template;
    },

    use_template(value) {
      if (this.$store.getters.GetDirectoryForm == true) {
        this.$store.commit("Setlibraryformtype", "");
        this.$store.commit("SetformLibrary", false);
        this.$store.commit("SetVisitorFormEnabled", false);
        this.$store.commit("SetVisitorFormEdit", false);
      } else {
        this.$store.commit("SetFormName", value.form_name);
        this.$store.commit("SetVisitorFormEnabled", false);
        this.$store.commit("SetVisitorFormEdit", false);

        this.$store.commit("SetFormObj", value);
        this.$store.commit("SetformLibrary", false);
        this.$store.commit("Setlibraryformtype", "");
      }
    },
    checkLabelExists(array, namelabel) {
      for (let i = 0; i < array.length; i++) {
        if (array[i].displayLabel === namelabel) {
          return true;
        }
      }
      return false;
    },
    add_field() {
      this.minvalue = this.minvalue.toString();
      if (this.$refs.formlabel.validate()) {
        const labelExists = this.checkLabelExists(
          this.formFields,
          this.labelToDisplay
        );
        if (!labelExists) {
          if (
            this.selectedItem.type == "DROPDOWN" &&
            this.globalOptions.length == 0 &&
            (!this.fieldData || this.fieldData.trim().length === 0)
          ) {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: "Add atleast One Option",
              timeout: 5000,
              Top: true,
            };
          } else if (
            this.selectedItem.type == "GALLERY" &&
            this.signimagesarrayurls.length == 0
          ) {
            this.SnackBarComponent = {
              SnackbarVmodel: true,
              SnackbarColor: "red",
              SnackbarText: "Add atleast One Image",
              timeout: 5000,
              Top: true,
            };
          } else if (
            this.selectedItem.backend_type == "string" ||
            this.selectedItem.backend_type == "paragraph" ||
            this.selectedItem.backend_type == "number"
          ) {
            if (this.minvalue != "" && this.maxvalue != "") {
              if (Number(this.minvalue) < Number(this.maxvalue)) {
                this.formFields.push({
                  type: this.selectedItem.type,
                  label: this.labelToDisplay,
                  icon: this.selectedItem.icon,
                  backend_type: this.selectedItem.backend_type,
                  displayLabel: this.labelToDisplay,
                  is_displayed: true,
                  is_readonly: false,
                  is_required: this.madatoryField,
                  hide_on_creation: this.hideOncreation,
                  min_value: Number(this.minvalue),
                  max_value: Number(this.maxvalue),
                  fieldOptions:
                    this.selectedItem.type == "GALLERY"
                      ? this.signimagesarrayurls
                      : this.globalOptions,
                });
                this.componentCheck = false;
                this.minvalue = "1";
                this.maxvalue = "100";
                this.datetimevalidation = "past_future";
              } else {
                this.SnackBarComponent = {
                  SnackbarVmodel: true,
                  SnackbarColor: "red",
                  SnackbarText:
                    "The minimum value cannot be greater than the maximum value",
                  timeout: 5000,
                  Top: true,
                };
              }
            }
          } else if (this.selectedItem.backend_type == "date") {
            this.formFields.push({
              type: this.selectedItem.type,
              label: this.labelToDisplay,
              icon: this.selectedItem.icon,
              backend_type: this.selectedItem.backend_type,
              displayLabel: this.labelToDisplay,
              is_displayed: true,
              is_readonly: false,
              is_required: this.madatoryField,
              hide_on_creation: this.hideOncreation,
              date_valid: this.datetimevalidation,
              fieldOptions:
                this.selectedItem.type == "GALLERY"
                  ? this.signimagesarrayurls
                  : this.globalOptions,
            });
            this.componentCheck = false;
            this.datetimevalidation = "past_future";
          } else {
            this.formFields.push({
              type: this.selectedItem.type,
              label: this.labelToDisplay,
              icon: this.selectedItem.icon,
              backend_type: this.selectedItem.backend_type,
              displayLabel: this.labelToDisplay,
              is_displayed: true,
              is_readonly: false,
              is_required: this.madatoryField,
              hide_on_creation: this.hideOncreation,
              active_field_type:
                this.selectedItem.active_field_type != undefined
                  ? this.selectedItem.active_field_type
                  : undefined,
              fieldOptions:
                this.selectedItem.type == "GALLERY"
                  ? this.signimagesarrayurls
                  : this.globalOptions,
            });
            this.componentCheck = false;
          }
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "A label for the display already exists",
            timeout: 5000,
            Top: true,
          };
        }
      }
    },

    async get_edit_field(value) {
      this.selectedItem = {};
      this.labelToDisplay = "";
      this.componentCheck = true;
      this.selectedItem = value;
      this.showTitleCheck = 0;
      this.labelToDisplay = value.label;
      this.madatoryField = value.is_required;
      this.hideOncreation =
        value.hide_on_creation == undefined ? false : value.hide_on_creation;
      this.minvalue = value.min_value;
      this.maxvalue = value.max_value;
      this.datetimevalidation = value.date_valid;
      this.editable = true;
      if (value.type == "GALLERY") {
        this.signimagesarrayurls = value.fieldOptions;
        this.converteUrl = [];
        if (value.fieldOptions.length != 0) {
          const details = this.$store.getters.GetOrgDetails;
          for (let i = 0; i < value.fieldOptions.length; i++) {
            const signedUrl = await getS3SignedUrl(
              value.fieldOptions[i],
              details.s3_details
            );

            this.converteUrl.push(signedUrl);
          }
          this.converteUrl = [...new Set(this.converteUrl)];
        }
      } else {
        this.globalOptions = value.fieldOptions;
      }
    },

    get_edit_index(value) {
      if (value == 0) {
        this.showTitleCheck = 1;
      } else {
        this.showTitleCheck = 0;
      }
    },

    error_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "red",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
    },

    get_mandatory_value(value) {
      if (this.editable == true) {
        this.formFields.forEach((element) => {
          if (element.label == this.selectedItem.label) {
            element.is_required = value;
          }
        });
      }
    },

    get_hidden_value(value) {
      if (this.editable == true) {
        this.formFields.forEach((element) => {
          if (element.label == this.selectedItem.label) {
            element.hide_on_creation = value;
          }
        });
      }
    },

    get_min_value(value) {
      if (this.editable == true) {
        this.formFields.forEach((element) => {
          if (element.label == this.selectedItem.label) {
            element.min_value = Number(value);
          }
        });
      }
    },

    get_max_value(value) {
      if (this.editable == true) {
        this.formFields.forEach((element) => {
          if (element.label == this.selectedItem.label) {
            element.max_value = Number(value);
          }
        });
      }
    },
    get_input_value(value) {
      if (this.editable == true) {
        this.formFields.forEach((element) => {
          if (element.label == this.selectedItem.label) {
            element.label = value;
            element.displayLabel = value;
          }
        });
      }
    },

    back_action() {
      this.componentCheck = false;
      this.labelToDisplay = "";
      this.minvalue = "1";
      this.maxvalue = "100";
      this.datetimevalidation = "past_future";
    },

    preview_action() {
      this.previewCheck = 2;
      this.previewDialog = true;
    },

    save_directory_form() {
      this.formDataArray = this.formFields;
      this.directoryFormDialog = true;
      this.previewCheck = 4;
    },

    save_actions() {
      this.formDataArray = this.formFields;
      this.previewCheck = 1;
      this.publishFormDialog = true;
    },

    async add_options(value) {
      const { valid } = await this.$refs.form.validate();
      if (valid) {
        if (!this.globalOptions.includes(value)) {
          this.globalOptions.push(value);
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: "This Option already Exist",
            timeout: 5000,
            Top: true,
          };
        }
      }

      this.fieldData = "";
      this.$refs.form.reset();
    },

    delete_data(val) {
      this.globalOptions.splice(val, 1);
    },

    clearAllOptions() {
      this.globalOptions = [];
      this.showDeleteAllDialog = false;
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarText: "All options have been cleared successfully",
        SnackbarColor: "success",
      };
    },

    get_completeion() {
      setTimeout(() => {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "green",
          SnackbarText: "Form Designed Successfully",
          timeout: 5000,
          Top: true,
        };
        this.$router.push("/home/AdminFlowDesigner");
      }, 500);
    },

    directory_Success(value) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: "Form Designed Successfully",
        timeout: 5000,
        Top: true,
      };
      this.directoryFormDialog = false;

      this.$store.commit("SetDirectoryForm", true);
      this.$store.commit("SetformLibrary", false);

      this.$store.commit(
        "SetFormName",
        value.Directory_design_settings[0].directory_name
      );
      this.$store.commit("SetFormObj", value.Directory_design_settings[0]);
    },

    navigate_path() {
      this.$router.push("/home/FormDesignerAdmin");
    },

    back_call() {
      if (this.$store.getters.GetDirectoryForm == true) {
        this.$router.push("/home/DirectoryList");
      } else {
        if (this.$store.getters.GetEditFormDetails.FormEdit == true) {
          this.$router.push({
            name: "FormDesignerAdmin",
            params: {
              formMethod: "Forms",
            },
          });
        } else {
          if (this.$store.getters.GetFormLibrary == false) {
            this.create_form();
          } else {
            this.$router.push({
              name: "FormDesignerAdmin",
              params: {
                formMethod: "Forms",
              },
            });
          }
        }
      }
    },
    async create_form() {
      var data = this.$store.getters.GetUserObj;
      try {
        let result = await API.graphql(
          graphqlOperation(draft_custom_form, {
            input: {
              organization_id: data.organization.organization_id,
              form_id: this.$store.getters.GetFormObject.form_id,
              form_design_template: JSON.stringify(this.formFields),
              is_form_designed: true,
              enum_type: this.$store.getters.GetFormType,
              user_email_id: data.user.user_email_id,
            },
          })
        );
        var response = JSON.parse(result.data.draft_custom_form);
        if (response.Status == "SUCCESS") {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "green",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
          this.$router.push({
            name: "FormDesignerAdmin",
            params: {
              formMethod: "Forms",
            },
          });
        } else {
          this.SnackBarComponent = {
            SnackbarVmodel: true,
            SnackbarColor: "red",
            SnackbarText: response.Message,
            timeout: 5000,
            Top: true,
          };
        }
      } catch (error) {
        this.SnackBarComponent = {
          SnackbarVmodel: true,
          SnackbarColor: "red",
          SnackbarText: error.errors[0].message,
          timeout: 5000,
          Top: true,
        };
      }
    },
    async save_visit_form() {
      this.loadingvist = true;
      var data = this.$store.getters.GetUserObj;
      var visitdata = this.$store.getters.Getvisitdetails;
      try {
        let result = await API.graphql(
          graphqlOperation(Visit_type_creation, {
            input: {
              user_email_id: data.user.user_email_id,
              visit_type_name: visitdata.visit_type_name,
              visit_type_frequency: visitdata.visit_type_frequency,
              visit_type_representation: visitdata.visit_type_representation,
              scan_tolerance: visitdata.scan_tolerance,
              adhock_approval_required: visitdata.adhock_approval_required,
              form_design_template: JSON.stringify(this.formFields),
            },
          })
        );

        this.loadingvist = false;

        var response = JSON.parse(result.data.Visit_type_creation);
        this.loadingvist = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$store.commit("Setvisitdetails", {});
          this.$store.commit("SetVisitorFormEnabled", false);
          this.$store.commit("SetVisitorFormEdit", false);
          this.formFields = [];
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loadingvist = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    async edit_visit_form() {
      this.loadingvist = true;

      var visitdata = this.$store.getters.Getvisitdetails;
      try {
        let result = await API.graphql(
          graphqlOperation(edit_visittype_form, {
            input: {
              visit_type_id: visitdata.visit_type_id,
              form_design_template: JSON.stringify(this.formFields),
            },
          })
        );

        this.loadingvist = false;

        var response = JSON.parse(result.data.edit_visittype_form);
        this.loadingvist = false;
        if (response.Status == "SUCCESS") {
          this.$emit("successMsg", response.Message);
          this.$emit("successMsg", "Form Updated Successfully");
          this.$store.commit("Setvisitdetails", {});
          this.$store.commit("SetVisitorFormEnabled", false);
          this.$store.commit("SetVisitorFormEdit", false);
          this.formFields = [];
        } else {
          this.$emit("errorMsg", response.Message);
        }
      } catch (error) {
        this.loadingvist = false;
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
    async GetvisitForm() {
      var data = this.$store.getters.GetUserObj;
      var visitdata = this.$store.getters.Getvisitdetails;
      try {
        let result = await API.graphql(
          graphqlOperation(get_visit_type_form, {
            input: {
              organization_id: data.organization.organization_id,
              visit_type_id: visitdata.form_id,
            },
          })
        );

        var response = JSON.parse(result.data.get_visit_type_form);
        this.formFields = [];
        if (response.Status == "SUCCESS") {
          this.formFields = response.form[0].form_design_template;
        } else {
          this.formFields = [];
        }
      } catch (error) {
        this.formFields = [];
        this.$emit("errorMsg", error.errors[0].message);
      }
    },
  },
};
</script>
<style scoped>
.card-content {
  overflow: auto; /* Add overflow property to handle content overflow */
}
.text-left {
  text-align: left;
}
</style> -->