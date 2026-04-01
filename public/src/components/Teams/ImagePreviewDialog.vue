

<template>
    <v-dialog :model-value="imagePreviewDialog" width="300" persistent   @update:model-value="$emit('close')"
>
        <v-card class="pa-4" rounded="xl">
            <v-card-title class="d-flex justify-end align-center">
            <v-icon @click="$emit('close')" size="small" >mdi-close</v-icon>
      </v-card-title>
      <v-card-text class="text-center">
        <v-img  :src="selectedUserDetail.user_profile_pic_url"
        max-height="400"
        aspect-ratio="1"
        contain
        class="rounded-xl"/>

      </v-card-text>
              <span class="user-name d-flex justify-center align-center">{{ selectedUserDetail.full_user_name }}</span>

        </v-card>
    </v-dialog>
</template>
<script>

export default{

props:{
    selectedUserDetail: Object,

    imagePreviewDialog:Boolean


},
emits:['close']
}
</script>
<style scoped>
.user-name{
    margin-top: 2%;
}
</style>