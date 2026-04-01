<template>
  <div>
    <v-card flat>
      <v-select
        dense
        v-if="viewAction == 'Inititaie' || viewAction == 'Deployed'"
        class=""
        outlined
        v-model="selectedValue"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :item-text="index.value_label"
        :rules="index.is_required == true ? [(v) => !!v || 'required '] : []"
        :item-value="index.value"
        :items="index.input_array_value != null ? index.input_array_value : []"
        @change="emit_values(selectedValue, index.display_label, index.key)"
      ></v-select>
      <v-select
        dense
        class=""
        v-if="viewAction == 'Pending' || viewAction == 'Submited'"
        outlined
        v-model="inputValue"
        :label="
          index.is_required == true
            ? index.display_label + '*'
            : index.display_label
        "
        :items="index.input_array_value != null ? index.input_array_value : []"
        :item-text="index.value_label"
        :rules="index.is_required == true ? [(v) => !!v || 'required '] : []"
        :item-value="index.value"
        @change="emit_data(inputValue, index.display_label, index.key)"
      ></v-select>
    </v-card>
  </div>
</template>
<script>
/* eslint-disable */
export default {
  props: {
    index: Object,
    viewAction: String,
  },
  data: () => ({
    Toggle: 0,
    selectedValue: "",
    inputValue: "",
  }),
  async created() {
    if (this.viewAction == "Pending" || this.viewAction == "Submited") {
      if (this.index.input_value == "country_list") {
        this.fetch_countries();
      }
      if (this.index.input_value == "list_users") {
        this.fetch_users();
      } else {
        this.inputValue = this.index.value;
      }
    }
  },
  methods: {
    emit_values(fieldValue, fieldLabel, fieldKey) {
      var data = {
        label: fieldLabel,
        value: fieldValue,
        key: fieldKey,
      };
      this.$emit("dropdown", data);
    },
    emit_data(fieldValue, fieldLabel, fieldKey) {
      var data2 = {
        label: fieldLabel,
        value: this.fetch_field_values(fieldValue),

        key: fieldKey,
      };

      // this.$emit("dropdown", data2);
    },
    fetch_field_values(value) {
      var code = "";
      var user = "";
      if (this.index.input_value == "country_list") {
        this.index.input_array_value.forEach((element) => {
          if (value == element.name) {
            code = element.code;
          }
        });
        return code;
      } else if (this.index.input_value == "list_users") {
        this.index.input_array_value.forEach((element) => {
          if (value == element.full_user_name) {
            user = element.user_id;
          }
        });
        return user;
      } else {
        return value;
      }
    },
    // fetch_value(value) {},
    fetch_users() {
      var usersData = "";
      this.index.input_array_value.forEach((element) => {
        if (this.index.value == element.user_id) {
          usersData = element.full_user_name;
        }
      });
      return (this.inputValue = usersData);
    },

    fetch_countries() {
      var countryData = "";
      this.index.input_array_value.forEach((element) => {
        if (this.index.value == element.code) {
          countryData = element.name;
        }
      });
      return (this.inputValue = countryData);
    },
  },
};
</script>
