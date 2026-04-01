<template>
  <div>
    <v-card flat
    >
    <v-card-text>
      <v-toolbar dense flat>
        <v-spacer />
        <v-btn dark class="text-capitalize cardCss" @click="back_call()">
          <v-icon class="mr-2">mdi-step-backward</v-icon>
          Back
        </v-btn>
      </v-toolbar>
      </v-card-text>
    </v-card>
  </div>
</template>

<script>
export default {
  methods: {
    back_call() {
      this.$router.push("/UserlevelApp");
    },
  },
};
</script>

<style>
</style>