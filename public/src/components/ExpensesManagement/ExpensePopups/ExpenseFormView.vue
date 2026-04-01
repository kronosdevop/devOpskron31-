<template>
  <div>
    <v-card flat>
      <v-card-title class="mt-n2">Expense Form</v-card-title>
      <v-card-text>
        <v-form disabled ref="form">
          <v-row no-gutters>
            <v-col
              v-for="(index, Idx) in templateSteps.workflow_template"
              :key="Idx"
              cols="12"
              sm="12"
              md="12"
              xs="12"
            >
              <TextField
                v-if="
                  index.data_type == 'string' || index.data_type == 'paragraph'
                "
                :formActionType="formActionType"
                :index="index"
              />
              <EmailField
                v-if="index.data_type == 'email'"
                :formActionType="formActionType"
                :index="index"
              />
              <NumberField
                v-if="index.data_type == 'number'"
                :formActionType="formActionType"
                :index="index"
              />
              <CheckboxField
                v-if="index.data_type == 'checkbox'"
                :formActionType="formActionType"
                :index="index"
              />

              <DateField
                :formActionType="formActionType"
                v-if="index.data_type == 'date'"
                :index="index"
              />

              <DropdowmField
                v-if="index.data_type == 'single_choice'"
                :formActionType="formActionType"
                :index="index"
              />

              <TimePicker
                :formActionType="formActionType"
                v-if="index.data_type == 'time'"
                :index="index"
              />
              <RatingFile
                class="mt-n1"
                :formActionType="formActionType"
                v-if="index.data_type == 'rating'"
                :index="index"
              />
              <DividerComp
                :formActionType="formActionType"
                v-if="index.data_type == 'divider'"
                :index="index"
              />
              <FlipSwitch
                class="mt-n2"
                :formActionType="formActionType"
                v-if="index.data_type == 'boolean'"
                :index="index"
              />
              <LabelField
                class="mt-n2"
                :formActionType="formActionType"
                v-if="index.data_type == 'label'"
                :index="index"
              />
              <MediaField
                class="mt-n2"
                :formActionType="formActionType"
                v-if="index.data_type == 'media'"
                :index="index"
              />
              <CountryListField
                class="mt-n2"
                :formActionType="formActionType"
                v-if="index.data_type == 'countrylist'"
                :index="index"
              />
              <!-- comment this untill its completed -->
              <MobileNumberField
                class="mt-n2"
                :formActionType="formActionType"
                v-if="index.data_type == 'phonenumber'"
                :index="index"
              />
              <UserMultiChoice
                class="mt-n2"
                :formActionType="formActionType"
                v-if="index.data_type == 'multi_choice'"
                :index="index"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
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
import MobileNumberField from "@/components/FormDesigner/FormFields/MobileNumberField.vue";
import YearField from "@/components/FormDesigner/FormFields/YearField.vue";
import DateTimeField from "@/components/FormDesigner/FormFields/DateTimeField.vue";
import UserMultiChoice from "@/components/FormDesigner/FormFields/UserMultiChoice.vue";

export default {
  props: {
    templateSteps: Object,
  },
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
    UrlField,
    LabelField,
    MediaField,
    YearField,
    CountryListField,
    MobileNumberField,
    DateTimeField,
    UserMultiChoice,
  },
  created() {
    this.height = window.innerHeight - 210;
    // console.log(this.templateSteps.workflow_template);
  },
  data() {
    return {
      formActionType: "initiate",
      height: 0,
    };
  },
};
</script>