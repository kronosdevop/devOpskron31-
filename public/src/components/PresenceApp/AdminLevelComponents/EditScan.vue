<template>
    <v-dialog :model-value="ScanEdit" persistent>
    <v-card>
        <v-card-title><v-icon>mdi-pond</v-icon> Scan Tolerance
         <v-icon @click="CloseDialog">mdi-close</v-icon>
        </v-card-title>
              <v-select
                density="compact"
                variant="outlined"
                v-model="scanTolerance"
                v-on:keypress="is_Number($event)"
                :items="itemsData"
                label="Scan Tolerance"
              />
    </v-card>
    </v-dialog>
</template>
<script>
export default{
    props:{
                ScanEdit : Boolean,

    },
    data(){
        return{
            scanTolerance: null,
        }
    },
    methods:{
        CloseDialog(){
            this.$emit('close',0)
        },
         is_Number(evt) {
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
    }
    }
}
</script>