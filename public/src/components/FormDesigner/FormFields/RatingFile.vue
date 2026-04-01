<template>
  <div>
    <v-card flat v-if="formActionType != 'initiate'">
      <v-text-field
        dense
          density="compact"
        variant="outlined"
        class="ma-2"
        :label="
          index.is_required == true
            ? index.displayLabel + '*'
            : index.displayLabel
        "
        rows="0"
        auto-grow
        :append-icon="shouldShowDeleteIcon ? 'mdi-delete' : ''"
        @click:append="emit_fields((Toggle = 1), index)"
        @click="emit_edit_field(index)"
      >
        <!-- <template #append>
          <v-icon color="red">mdi-delete</v-icon>
        </template> -->
      </v-text-field>
      <!-- <v-card-text>
        <v-card @click="emit_edit_field(index)" flat>
          <div class="text-left">
            {{ 
            index.is_required == true
              ? index.displayLabel + '*'
              : index.displayLabel
           }}

            <v-rating
              readonly
              v-model="rating"
              background-color="indigo lighten-3"
              color="primaryColor"
              size="50"
            ></v-rating>
          </div>
        </v-card>
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
      </v-card-text> -->
    </v-card>
    <v-card flat v-else class="pa-2">
      <div v-if="index.is_displayed == true" class="text-left">
        {{
          index.is_required == true
            ? index.display_label + "*"
            : index.display_label
        }}
        <v-rating
          v-model="rating"
          :readonly="index.is_readonly"
          background-color="indigo lighten-3"
          color="primaryColor"
          size="30"
          :rules="index.is_required == true ? [(v) => !!v || 'required '] : []"
          @update:modelValue="get_value(rating, index.display_label, index.key)"
        
        ></v-rating>
      </div>
    </v-card>
  </div>
</template>
<script>
export default {
  props: {
    index: Object,
    formActionType: String,
    formAction: String,
    formTemplate: Array,
  },
  data() {
    return {
      rating: 0,
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
  created() {
    if (this.formAction == "Pending") {
      this.formTemplate.forEach((element) => {
        if (element.key == this.index.key) {
          this.rating = Number(element.respectiveValue) ;
        }
      });
    }
  },
  methods: {
    emit_fields(Toggle, index) {
      this.$emit("clicked", Toggle, index);
    },
    get_value(fieldvalue, fieldlabel, fieldKey) {
      var data = {
        label: fieldlabel,
        value: fieldvalue,
        key: fieldKey,
      };
      this.$emit("ratingField", data);
    },
    emit_edit_field(value) {
      this.$emit("ratingEdit", value);
    },
  },
};
</script>