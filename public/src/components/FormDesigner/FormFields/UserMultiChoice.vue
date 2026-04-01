<template>
  <div>
    <v-card flat v-if="formActionType != 'initiate'">
      <!-- <v-card-text> -->
      <v-select
        density="compact"
        variant="outlined"
        readonly
        class="ma-2"
        :label="
          index.is_required == true
            ? index.displayLabel + '*'
            : index.displayLabel
        "
        :items="index.fieldOptions"
        @click="emit_edit_field(index)"
        :append-icon="shouldShowDeleteIcon ? 'mdi-delete' : ''"
        @click:append="emit_fields((Toggle = 1), index)"
      >
      </v-select>
    </v-card>
    <v-card flat v-else class="pa-2">
      <!-- tt -->
      <v-select
        v-if="index.is_displayed == true"
        density="compact"
        variant="outlined"
        :readonly="index.is_readonly"
        v-model="multiSelect"
        class=""
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :rules="
          index.is_required === true
            ? [(v) => v.length > 0 || 'At least one user  must be selected']
            : []
        "
        :items="items"
        item-title="full_user_name"
        item-value="user_id"
        multiple
        @update:modelValue="get_value(multiSelect, index.display_label, index.key, index)"
   
      ></v-select>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */

import { get_all_users } from "@/mixins/GetAllUsers.js";

export default {
  props: {
    index: Object,
    formActionType: String,
    formAction: String,
    formTemplate: Array,
  },
  mixins: [get_all_users],
  data() {
    return {
      multiSelect: [],
      items: [],
      allUsers: [],
    };
  },

  computed: {
    shouldShowDeleteIcon() {
      // Check your conditions here
      if (
        this.formActionType !== "initiate" &&
        this.formActionType !== "preview"
      ) {
        return true; // Show the icon
      } else {
        return false; // Do not show the icon
      }
    },
  },

  async mounted() {
    if (this.formActionType != undefined) {
      await this.get_all_users();
      this.fetch_update_items();
    }
  },
  created() {
    this.items = [];
    this.allUsers = [];

    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          this.multiSelect =
            element.respectiveValue == "N/A"
              ? []
              : element.respectiveValue.trim().split(/\s*,\s*/);

          // this.itemsValue.push(element.respectiveValue);
        }
      });
    }
  },

  methods: {
    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },

    emit_edit_field(value) {
      this.$emit("multiChoiceEdit", value);
    },

    get_value(fieldvalue, fieldlabel, fieldKey, index) {
      var data = {
        label: fieldlabel,
        value: fieldvalue.lenght == 0 ? "N/A" : fieldvalue.join(","),
        key: fieldKey,
        text:
          fieldvalue.lenght == 0
            ? "N/A"
            : this.fetch_user_name(fieldvalue, index),
      };
      //   console.log(data);
      this.$emit("multichoice", data);
    },

    async fetch_update_items() {
      var data = this.listUsers
        .filter((element) => element.user_type !== "CHATBOT")
        .map((element) => ({
          full_user_name: element.full_user_name,
          user_id: element.user_id,
        }))
        .sort((a, b) => a.full_user_name.localeCompare(b.full_user_name));

      this.allUsers = data;
      this.items = data;
      //   console.log(this.items);
    },

    fetch_user_name(value) {
      var names = [];
      for (var i = 0; i < value.length; i++) {
        var id = value[i];
        for (var j = 0; j < this.allUsers.length; j++) {
          if (this.allUsers[j].user_id === id) {
            names.push(this.allUsers[j].full_user_name);
            break; // Break the inner loop once match is found
          }
        }
      }

      return names.join(",");
    },
  },
};
</script>