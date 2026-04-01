<template>
  <div>
    <SnackBar :SnackBarComponent="SnackBarComponent" />
    <v-card
      flat
      outlined
      class="elevation-2 overflow-y-auto pb-2"
      :height="cardHeight"
    >
      <!-- <v-toolbar dense flat>
        <v-spacer />
        <v-btn
          dark
          :disabled="formFields.length == 0"
          @click="preview_action()"
          class="text-capitalize cardCss"
          >Preview</v-btn
        >
        <v-btn
          dark
          :disabled="formFields.length == 0"
          @click="save_actions()"
          class="text-capitalize ml-2 cardCss"
          >Save</v-btn
        >
      </v-toolbar> -->
      <!-- <v-card-text class="py-0"> -->
      <v-row no-gutters id="draggable-row" @dragover="allowDrop" @drop="drop">
        <v-col
          v-for="(index, Idx) in formFields"
          :key="Idx"
          cols="12"
          sm="12"
          :draggable="true"
          @dragstart="dragStart(index, Idx)"
          @dragend="dragEnd(index, Idx)"
          @dragover="dragOver(Idx)"
          xs="12"
          md="12"
        >
          <TextField
            v-if="
              index.type == 'TEXTFIELD' ||
              index.type == 'NAME' ||
              index.type == 'DROPDOWN' ||
              index.type == 'TEAMLIST' ||
              index.type == 'LOCATIONLIST' ||
              index.type == 'DESIGNATIONLIST' ||
              index.type == 'GROUPLIST' ||
              index.type == 'COUNTRYLIST' ||
              index.type == 'VENDORSLIST' ||
              index.type == 'PRODUCTSLIST' ||
              index.type == 'CUSTOMERSLIST' ||
              index.type == 'TIME' ||
              index.type == 'DATE'
            "
            :index="index"
            :Idx="Idx"
            v-on:textEdit="get_edit_field"
            v-on:textIndex="get_index_value"
            @clicked="emit_fields"
          />
          <EmailField
            v-if="index.type == 'EMAIL'"
            :index="index"
            v-on:emailEdit="get_edit_field"
            @clicked="emit_fields"
          />

          <NumberField
            v-if="index.type == 'NUMBER'"
            :index="index"
            :Idx="Idx"
            v-on:numberEdit="get_edit_field"
            v-on:numIndex="get_index_value"
            @clicked="emit_fields"
          />
          <!-- v-if="index.type == 'NUMBER' || index.type == 'MOBILENUMBER'" -->
          <CheckboxField
            v-if="index.type == 'CHECKBOX'"
            :index="index"
            v-on:checkboxEdit="get_edit_field"
            @clicked="emit_fields"
          />

          <TextAreaField
            v-if="index.type == 'PARAGRAPH'"
            :index="index"
            v-on:paragrapghEdit="get_edit_field"
            @clicked="emit_fields"
          />

          <!-- <DateField
            v-if="index.type == 'DATE'"
            :index="index"
            :Idx="Idx"
            v-on:editDate="get_edit_field"
            v-on:dateIndex="get_index_value"
            @clicked="emit_fields"
          /> -->

          <!-- <DropdowmField
            v-if="
              index.type == 'DROPDOWN' ||
              index.type == 'TEAMLIST' ||
              index.type == 'LOCATIONLIST' ||
              index.type == 'DESIGNATIONLIST' ||
              index.type == 'GROUPLIST' ||
              index.type == 'COUNTRYLIST' ||
              index.type == 'VENDORSLIST' ||
              index.type == 'PRODUCTSLIST' ||
              index.type == 'CUSTOMERSLIST'
            "
            :index="index"
            v-on:dropdownEdit="get_edit_field"
            @clicked="emit_fields"
          /> -->

          <!-- <TimePicker
            v-if="index.type == 'TIME'"
            :index="index"
            v-on:timeEdit="get_edit_field"
            @clicked="emit_fields"
          /> -->

          <RatingFile
            v-if="index.type == 'RATING'"
            :index="index"
            v-on:ratingEdit="get_edit_field"
            @clicked="emit_fields"
          />

          <DividerComp
            v-if="index.type == 'DIVIDER'"
            :index="index"
            v-on:errorMsg="error_info"
            @clicked="emit_fields"
          />

          <FlipSwitch
            v-if="index.type == 'FLIPSWITCH'"
            :index="index"
            v-on:flipEdit="get_edit_field"
            @clicked="emit_fields"
          />

          <UrlField
            v-if="index.type == 'URL' || index.type == 'YOUTUBE'"
            :index="index"
            v-on:urlEdit="get_edit_field"
            @clicked="emit_fields"
          />

          <LabelField
            v-if="index.type == 'LABEL'"
            :index="index"
            v-on:labelEdit="get_edit_field"
            @clicked="emit_fields"
          />

          <MediaField
            v-if="index.type == 'MEDIA'"
            :index="index"
            v-on:mediaEdit="get_edit_field"
            @clicked="emit_fields"
          />

          <CountryListField
            v-if="index.type == 'CountryList'"
            v-on:countryEdit="get_edit_field"
            :index="index"
            @clicked="emit_fields"
          />
          <ImageviewField
            v-if="index.type == 'GALLERY'"
            v-on:imageedit="get_edit_field"
            :index="index"
            @clicked="emit_fields"
          />
          <!-- <TeamsList
              v-if="index.type == 'TEAMLIST'"
              :index="index"
              v-on:TeamsEdit="get_edit_field"
              @clicked="emit_fields"
            /> -->
          <!-- <LoctionList
              v-if="index.type == 'LOCATIONLIST'"
              :index="index"
              v-on:LocationEdit="get_edit_field"
              @clicked="emit_fields"
            /> -->
          <!-- <DesginationList
              v-if="index.type == 'DESIGNATIONLIST'"
              :index="index"
              v-on:DesginationEdit="get_edit_field"
              @clicked="emit_fields"
            /> -->
          <!-- <GroupList
              v-if="index.type == 'GROUPLIST'"
              :index="index"
              v-on:GroupEdit="get_edit_field"
              @clicked="emit_fields"
            /> -->
          <MobileNumberField
            v-if="index.type == 'MOBILENUMBER'"
            :index="index"
            v-on:phoneNumberEdit="get_edit_field"
            @clicked="emit_fields"
          />
          <!--  v-on:mediaEdit="get_edit_field" -->
          <YearField
            v-if="index.type == 'YEAR'"
            :index="index"
            v-on:editYear="get_edit_field"
            @clicked="emit_fields"
          />
          <DateTimeField
            v-if="index.type == 'DATETIME'"
            :index="index"
            :Idx="Idx"
            v-on:datetimeEdit="get_edit_field"
            v-on:dateTimeIndex="get_index_value"
            @clicked="emit_fields"
          />
          <UserMultiChoice
            v-if="index.type == 'MULTICHOICE'"
            :index="index"
            :Idx="Idx"
            v-on:multiChoiceEdit="get_edit_field"
            v-on:dateTimeIndex="get_index_value"
            @clicked="emit_fields"
          />
        </v-col>
      </v-row>
      <!-- </v-card-text> -->
    </v-card>
    <div v-if="componentCheck == 1">
      <FormPusblishDialog
        :publishFormDialog="publishFormDialog"
        :formDataArray="formDataArray"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="publishFormDialog = false"
      />
    </div>
    <div v-if="componentCheck == 2">
      <FormPreview
        :previewDialog="previewDialog"
        :formFields="formFields"
        @clicked="previewDialog = false"
      />
    </div>
    <div v-if="componentCheck == 1">
      <FormPusblishDialog
        :publishFormDialog="publishFormDialog"
        :formDataArray="formDataArray"
        v-on:errorMsg="error_info"
        v-on:successMsg="success_info"
        @clicked="publishFormDialog = false"
      />
    </div>
  </div>
</template>
<script>
/* eslint-disable */
import ImageviewField from "@/components/FormDesigner/FormFields/ImageviewField.vue";
import TextField from "@/components/FormDesigner/FormFields/TextField.vue";
import NumberField from "@/components/FormDesigner/FormFields/NumberField.vue";
import CheckboxField from "@/components/FormDesigner/FormFields/CheckboxField.vue";
import TextAreaField from "@/components/FormDesigner/FormFields/TextAreaField.vue";
import DateField from "@/components/FormDesigner/FormFields/DateField.vue";
import EmailField from "@/components/FormDesigner/FormFields/EmailField.vue";
import DropdowmField from "@/components/FormDesigner/FormFields/DropdowmField.vue";
import TimePicker from "@/components/FormDesigner/FormFields/TimePicker.vue";
import RatingFile from "@/components/FormDesigner/FormFields/RatingFile.vue";
import DividerComp from "@/components/FormDesigner/FormFields/DividerComp.vue";
import FlipSwitch from "@/components/FormDesigner/FormFields/FlipSwitch.vue";
import UrlField from "@/components/FormDesigner/FormFields/UrlField.vue";
import LabelField from "@/components/FormDesigner/FormFields/LabelField.vue";
import MediaField from "@/components/FormDesigner/FormFields/MediaField.vue";
import CountryListField from "@/components/FormDesigner/FormFields/CountryListField.vue";
import TeamsList from "@/components/FormDesigner/ActiiveFileds/TeamsList.vue";
import LoctionList from "@/components/FormDesigner/ActiiveFileds/LoctionList.vue";
import MobileNumberField from "@/components/FormDesigner/FormFields/MobileNumberField.vue";
import YearField from "@/components/FormDesigner/FormFields/YearField.vue";
import DateTimeField from "@/components/FormDesigner/FormFields/DateTimeField.vue";
import SnackBar from "@/components/SnackBar.vue";
import FormPusblishDialog from "@/components/FormDesigner/FormDialogs/FormPusblishDialog.vue";
import FormPreview from "@/components/FormDesigner/FormDialogs/FormPreview.vue";
import DesginationList from "@/components/FormDesigner/ActiiveFileds/DesginationList.vue";
import GroupList from "@/components/FormDesigner/ActiiveFileds/GroupList.vue";
import UserMultiChoice from "@/components/FormDesigner/FormFields/UserMultiChoice.vue";

import VueDraggable from "vue-draggable";

export default {
  props: {
    formFields: Array,
  },
  components: {
    TextField,
    ImageviewField,
    NumberField,
    CheckboxField,
    TextAreaField,
    DateField,
    DropdowmField,
    TimePicker,
    RatingFile,
    DividerComp,
    FlipSwitch,
    FormPusblishDialog,
    SnackBar,
    FormPreview,
    EmailField,
    UrlField,
    LabelField,
    MediaField,
    CountryListField,
    VueDraggable,
    TeamsList,
    LoctionList,
    DesginationList,
    GroupList,
    MobileNumberField,
    YearField,
    DateTimeField,
    UserMultiChoice,
  },
  data() {
    return {
      cardHeight: 0,
      formCreationDialog: false,
      formDataArray: [],
      componentCheck: 0,
      publishFormDialog: false,
      SnackBarComponent: {},
      previewDialog: false,
      draggedField: null,
      draggedIndex: null,
      dragOverIndex: null,
    };
  },

  mounted() {
    this.cardHeight = window.innerHeight - 171;
  },

  methods: {
    emit_fields(Toggle, Index) {
      if (Toggle == 1) {
        this.formFields.splice(this.formFields.indexOf(Index), 1);
      }
    },

    allowDrop(event) {
      // alert(4);
      // console.log(event);
      event.preventDefault();
    },

    dragStart(field, index) {
      // alert(index);
      this.draggedField = index;
      // console.log(this.draggedField);
    },

    dragEnd(index, Idx) {
      this.draggedField = null;

      if (this.dragOverIndex !== null) {
        if (this.$store.getters.GetdragCheck == false) {
          if (index === 0 && this.dragOverIndex > 0) {
            // Do not allow moving the first index down
            return;
          }
        }

        // Move the field to the new position in the formFields array
        const field = this.formFields[Idx];
        this.formFields.splice(Idx, 1);
        this.formFields.splice(this.dragOverIndex, 0, field);
      }

      this.dragOverIndex = null;
      // if (this.dragOverIndex !== null && this.dragOverIndex !== 0) {
      //   // Move the field to the new position in the formFields array
      //   const field = this.formFields[Idx];
      //   this.formFields.splice(Idx, 1);
      //   this.formFields.splice(this.dragOverIndex, 0, field);
      // }

      // this.dragOverIndex = null;
      // this.draggedField = null;
      // if (this.dragOverIndex !== null) {
      //   // Move the field to the new position in the formFields array
      //   const field = this.formFields[Idx];
      //   this.formFields.splice(Idx, 1);
      //   this.formFields.splice(this.dragOverIndex, 0, field);
      // }
      // this.dragOverIndex = null;
    },

    dragOver(Idx) {
      if (this.$store.getters.GetdragCheck == false) {
        if (Idx !== 0 && (this.draggedField !== 0 || Idx <= 0)) {
          this.dragOverIndex = Idx;
        }
      } else {
        this.dragOverIndex = Idx;
      }
      // if (Idx !== 0) {
      //   this.dragOverIndex = Idx;
      // }
      // this.dragOverIndex = Idx;
    },

    drop(event) {
      event.preventDefault();
      // if (this.draggedField) {
      //   const { field, index } = this.draggedField;

      //   // Add the field to the formFields array where it was dropped (at the end in this example).
      //   this.formFields.push(field);

      //   // Optionally, you can remove the field from its original position (if needed).
      //   this.formFields.splice(index, 1);

      //   // Reset the draggedField data property.
      //   // this.draggedField = null;
      // }
    },

    get_edit_field(value) {
      this.$emit("editValue", value);
    },

    get_index_value(value) {
      this.$emit("editIndex", value);
    },

    save_actions() {
      this.componentCheck = 1;
      this.publishFormDialog = true;
      this.formDataArray = this.formFields;
    },

    preview_action() {
      this.componentCheck = 2;
      this.previewDialog = true;
    },

    success_info(val) {
      this.SnackBarComponent = {
        SnackbarVmodel: true,
        SnackbarColor: "green",
        SnackbarText: val,
        timeout: 5000,
        Top: true,
      };
      this.publishFormDialog = false;
      this.$emit("formSubmission", "complete");
      // this.$router.push("/FormDesignerAdmin");
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
  },
};
</script>