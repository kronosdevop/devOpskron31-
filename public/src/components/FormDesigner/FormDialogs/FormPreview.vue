<template>
  <div>
    <!-- eslint-disable -->
    <v-dialog :model-value="previewDialog" @update:model-value="$emit('update:previewDialog', $event)" persistent max-width="700" transition="dialog-top-transition">
      <v-card flat class="">
        <v-toolbar elevation="0" dark dense class="navBar">
          <v-toolbar-title class="ml-4 text-black">
            <div class="custom-title">
              {{$store.getters.GetFormObject.form_name }}
            </div></v-toolbar-title
          >
          <v-spacer />
          <v-icon class="icon-class" @click="close_dialog()">mdi-close</v-icon>
        </v-toolbar>
        <v-card-text>
          <v-row no-gutters>
            <v-col
              v-for="(index, Idx) in formFields"
              :key="Idx"
              :cols="Idx === 0 ? '12' : '12 mt-n5'"
              sm="12"
              xs="12"
              md="12"
            >
              <!-- :cols="Idx === 0 ? '12' : '12 mt-n5'" -->
              <TextField
                :formActionType="formActionType"
                v-if="
                  index.type == 'TEXTFIELD' ||
                  index.type == 'EMAIL' ||
                  index.type == 'NAME'
                "
                :index="index"
              />
              <NumberField
                v-if="index.type == 'NUMBER'"
                :index="index"
                :formActionType="formActionType"
              />
              <!--   v-if="index.type == 'NUMBER' || index.type == 'MOBILENUMBER'" -->
              <CheckboxField
                class=""
                v-if="index.type == 'CHECKBOX'"
                :index="index"
                :formActionType="formActionType"
              />
              <TextAreaField
                v-if="index.type == 'PARAGRAPH'"
                :index="index"
                :formActionType="formActionType"
              />
              <DateField
                v-if="index.type == 'DATE'"
                :index="index"
                :formActionType="formActionType"
              />
              <DropdowmField
                v-if="index.type == 'DROPDOWN'"
                :index="index"
                :formActionType="formActionType"
              />
              <TimePicker
                v-if="index.type == 'TIME'"
                :index="index"
                :formActionType="formActionType"
              />
              <RatingFile
                class=""
                v-if="index.type == 'RATING'"
                :index="index"
                :formActionType="formActionType"
              />
              <DividerComp
                v-if="index.type == 'DIVIDER'"
                :index="index"
                :formActionType="formActionType"
              />
              <FlipSwitch
                v-if="index.type == 'FLIPSWITCH'"
                :index="index"
                class=""
                :formActionType="formActionType"
              />
              <UrlField
                v-if="index.type == 'URL' || index.type == 'YOUTUBE'"
                :index="index"
                :formActionType="formActionType"
              />
              <LabelField
                v-if="index.type == 'LABEL'"
                :index="index"
                :formActionType="formActionType"
              />
              <MediaField
                v-if="index.type == 'MEDIA'"
                :index="index"
                :formActionType="formActionType"
              />
              <YearField
                v-if="index.type == 'YEAR'"
                :index="index"
                :formActionType="formActionType"
              />
              <CountryListField
                v-if="index.type == 'COUNTRYLIST'"
                :index="index"
                :formActionType="formActionType"
              />
              <ImageviewField
                v-if="index.type == 'GALLERY'"
                :formActionType="formActionType"
                :index="index"
              />
              <TeamsList
                v-if="index.type == 'TEAMLIST'"
                :formActionType="formActionType"
                :index="index"
              />
              <LoctionList
                v-if="index.type == 'LOCATIONLIST'"
                :formActionType="formActionType"
                :index="index"
              />
              <DesginationList
                v-if="index.type == 'DESIGNATIONLIST'"
                :formActionType="formActionType"
                :index="index"
              />
              <GroupList
                v-if="index.type == 'GROUPLIST'"
                :formActionType="formActionType"
                :index="index"
              />
              <MobileNumberField
                v-if="index.type == 'MOBILENUMBER'"
                :formActionType="formActionType"
                :index="index"
              />
              <DateTimeField
                v-if="index.type == 'DATETIME'"
                :formActionType="formActionType"
                :index="index"
              />
              <UserMultiChoice
                v-if="index.type == 'MULTICHOICE'"
                :formActionType="formActionType"
                :index="index"
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
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
import DesginationList from "@/components/FormDesigner/ActiiveFileds/DesginationList.vue";
import GroupList from "@/components/FormDesigner/ActiiveFileds/GroupList.vue";
import MobileNumberField from "@/components/FormDesigner/FormFields/MobileNumberField.vue";
import YearField from "@/components/FormDesigner/FormFields/YearField.vue";
import DateTimeField from "@/components/FormDesigner/FormFields/DateTimeField.vue";
import UserMultiChoice from "@/components/FormDesigner/FormFields/UserMultiChoice.vue";

export default {
  props: {
    formFields: Array,
    previewDialog: Boolean,
  },
  components: {
    TextField,
    NumberField,
    CheckboxField,
    ImageviewField,
    TextAreaField,
    DateField,
    DropdowmField,
    TimePicker,
    RatingFile,
    DividerComp,
    FlipSwitch,
    UrlField,
    LabelField,
    MediaField,
    YearField,
    CountryListField,
    TeamsList,
    LoctionList,
    DesginationList,
    GroupList,
    MobileNumberField,
    DateTimeField,
    UserMultiChoice,
  },
  data() {
    return {
      formActionType: "preview",
    };
  },
  methods: {
    close_dialog() {
      this.$emit("clicked", 0);
    },
  },
};
</script>