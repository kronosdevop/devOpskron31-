<template>
  <div>
    <v-card disabled class="elevation-0 pb-4">
      <v-card-text class="py-0 ml-4">
        <v-row no-gutters>
          <v-col
            v-for="(index, Idx) in formFields"
            :key="Idx"
            cols="11"
            sm="11"
            xs="11"
            md="11"
            class="ma-2"
          >
            <!-- :cols="Idx === 0 ? '12' : '12 mt-n5'" -->
            <TextField
              :formActionType="formActionType"
              v-if="
                index.data_type == 'string' || index.data_type == 'paragraph'
              "
              :index="index"
            />
            <EmailField
              v-if="index.data_type == 'email'"
              :formActionType="formActionType"
              :index="index"
            />
            <NumberField
              v-if="index.data_type == 'number'"
              :index="index"
              :formActionType="formActionType"
            />
            <CheckboxField
              class=""
              v-if="index.data_type == 'checkbox'"
              :index="index"
              :formActionType="formActionType"
            />

            <!-- <TextAreaField
              v-if="index.data_type == 'paragraph'"
              :index="index"
              :formActionType="formActionType"
            /> -->
            <DateField
              v-if="index.data_type == 'date'"
              :index="index"
              :formActionType="formActionType"
            />
            <DropdowmField
              v-if="index.data_type == 'single_choice'"
              :index="index"
              :formActionType="formActionType"
            />
            <TimePicker
              v-if="index.data_type == 'time'"
              :index="index"
              :formActionType="formActionType"
            />
            <RatingFile
              class=""
              v-if="index.data_type == 'rating'"
              :index="index"
              :formActionType="formActionType"
            />
            <DividerComp
              v-if="index.data_type == 'divider'"
              :index="index"
              :formActionType="formActionType"
            />
            <FlipSwitch
              v-if="index.data_type == 'boolean'"
              :index="index"
              class=""
              :formActionType="formActionType"
            />
            <UrlField
              v-if="index.data_type == 'url' || index.data_type == 'youtube'"
              :index="index"
              :formActionType="formActionType"
            />
            <LabelField
              v-if="index.data_type == 'label'"
              :index="index"
              :formActionType="formActionType"
            />
            <MediaField
              v-if="index.data_type == 'media'"
              :index="index"
              :formActionType="formActionType"
            />
            <!-- <YearField
              v-if="index.data_type == 'year'"
              :index="index"
              :formActionType="formActionType"
            /> -->
            <CountryListField
              v-if="index.data_type == 'countrylist'"
              :index="index"
              :formActionType="formActionType"
            />
            <ImageviewField
              v-if="index.data_type == 'gallery'"
              :index="index"
              :formActionType="formActionType"
            />
            <TeamsList
              :formActionType="formActionType"
              v-if="index.data_type == 'team_list'"
              :index="index"
            />
            <LoctionList
              v-if="index.data_type == 'location_list'"
              :formActionType="formActionType"
              :index="index"
            />
            <DesginationList
              v-if="index.data_type == 'designation_list'"
              :formActionType="formActionType"
              :index="index"
            />
            <GroupList
              v-if="index.data_type == 'group_list'"
              :formActionType="formActionType"
              :index="index"
            />
            <MobileNumberField
              v-if="index.data_type == 'phonenumber'"
              :formActionType="formActionType"
              :index="index"
            />
            <YearField
              v-if="index.data_type == 'year'"
              :formActionType="formActionType"
              :index="index"
            />

            <DateTimeField
              v-if="index.data_type == 'datetime'"
              :formActionType="formActionType"
              :index="index"
            />
            <UserMultiChoice
              v-if="index.data_type == 'multi_choice'"
              :formActionType="formActionType"
              :index="index"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
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
import DesginationList from "@/components/FormDesigner/ActiiveFileds/DesginationList.vue";
import GroupList from "@/components/FormDesigner/ActiiveFileds/GroupList.vue";
import MobileNumberField from "@/components/FormDesigner/FormFields/MobileNumberField.vue";
import YearField from "@/components/FormDesigner/FormFields/YearField.vue";
import DateTimeField from "@/components/FormDesigner/FormFields/DateTimeField.vue";
import UserMultiChoice from "@/components/FormDesigner/FormFields/UserMultiChoice.vue";

export default {
  components: {
    TextField,
    NumberField,
    CheckboxField,
    TextAreaField,
    DateField,
    DropdowmField,
    TimePicker,
    RatingFile,
    DividerComp,
    FlipSwitch,
    ImageviewField,
    EmailField,
    UrlField,
    LabelField,
    MediaField,
    CountryListField,
    TeamsList,
    LoctionList,
    DesginationList,
    GroupList,
    MobileNumberField,
    YearField,
    DateTimeField,
    UserMultiChoice,
  },
  props: {
    formFields: Array,
  },
  created() {
    // console.log(this.formFields);
    // alert(2);
  },
  data() {
    return {
      formActionType: "initiate",
    };
  },
};
</script>