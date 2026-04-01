<template>
  <div>
    <v-card
      :flat="formActionType != undefined"
      v-if="formActionType != 'initiate'"
    >
      <v-card-text>
        <v-select
          dense
          readonly
          outlined
          class=""
          :label="
            index.is_required == true
              ? index.displayLabel + '*'
              : index.displayLabel
          "
          :items="index.fieldOptions"
          @click="emit_edit_field(index)"
        ></v-select>
        <v-btn
          x-small
          color="red"
          v-if="formActionType != 'initiate' && formActionType != 'preview'"
          fab
          dark
          absolute
          bottom
          right
          @click="emit_fields((Toggle = 1), index)"
        >
          <v-icon small>mdi-delete</v-icon>
        </v-btn>
      </v-card-text>
    </v-card>
    <v-card flat v-else>
      <v-select
        dense
        outlined
        :readonly="index.is_readonly"
        v-model="teamUsers"
        class=""
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="index.is_required === true ? [(v) => !!v || 'required'] : []"
        :items="teamsitems"
        item-text="full_user_name"
        item-value="user_id"
        @blur="get_value(teamUsers, index.display_label, index.key)"
      ></v-select>
    </v-card>
  </div>
</template>
  <script>
import { get_all_org_users } from "@/mixins/GetUsersDropdown.js";
export default {
  props: {
    index: Object,
    formActionType: String,
    formAction: String,
    formTemplate: Array,
  },
  mixins: [get_all_org_users],
  data: () => ({
    Toggle: 0,
    dropdownOption: "",
    itemsValue: [],
    teamUsers: "",
    teamsitems: [],
  }),

  async created() {
    // if (this.formActionType == "initiate") {
    this.$store.commit("Setnamesearch", "");
    await this.get_all_org_users();
    await this.fetch_details();
    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          this.teamUsers =
            element.respectiveValue == "N/A" ? "" : element.respectiveValue;

          // this.itemsValue.push(element.respectiveValue);
        }
      });
    }
    // }
  },

  methods: {
    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },

    emit_edit_field(value) {
      this.$emit("TeamsEdit", value);
    },

    fetch_details() {
      this.orgUsers.forEach((element) => {
        if (
          element.user_type != "CHATBOT" &&
          element.user_status != "DEACTIVE"
        ) {
          this.teamsitems.push({
            full_user_name: element.full_user_name,
            user_id: element.user_id,
          });
        }
      });
    },

    get_value(teamUsers, fieldlabel, fieldKey) {
      var data = {
        label: fieldlabel,
        value: teamUsers == "" ? "N/A" : teamUsers,
        key: fieldKey,
      };
      this.$emit("teamuserselected", data);
    },
  },
};
</script>
  