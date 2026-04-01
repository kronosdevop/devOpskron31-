# Vue 2 + Vuetify 2 to Vue 3 + Vuetify 3 Migration Guide

## Overview
This guide covers the migration from Vue 2 + Vuetify 2 to Vue 3 + Vuetify 3 using the Options API (not Composition API setup function).

## Key Changes Made

### 1. Package.json Updates
- Updated `vue` from `^2.6.14` to `^3.4.0`
- Updated `vuetify` from `^2.6.0` to `^3.4.0`
- Updated `vue-router` from `^3.5.1` to `^4.2.5`
- Updated `vuex` from `^3.0.1` to `^4.1.0`
- Removed `vue-croppa` (not compatible with Vue 3)

### 2. Main.js Changes
- Replaced `import Vue from 'vue'` with `import { createApp } from 'vue'`
- Replaced `new Vue()` with `createApp(App)`
- Updated event bus implementation for Vue 3
- Updated plugin registration syntax

### 3. Vuetify Plugin Updates
- Replaced `import Vuetify from 'vuetify/lib/framework'` with `import { createVuetify } from 'vuetify'`
- Added `import 'vuetify/styles'`
- Updated theme configuration syntax
- Removed manual component registration (Vuetify 3 auto-registers)

### 4. Router Updates
- Replaced `import VueRouter from 'vue-router'` with `import { createRouter, createWebHistory } from 'vue-router'`
- Replaced `new VueRouter()` with `createRouter({ history: createWebHistory(), routes })`
- Removed `Vue.use(VueRouter)`

### 5. Store Updates
- Replaced `import Vuex from 'vuex'` with `import { createStore } from 'vuex'`
- Replaced `new Vuex.Store()` with `createStore()`
- Removed `Vue.use(Vuex)`

### 6. App.vue Updates
- Wrapped content in `<v-app>` instead of `<div id="app">`
- Added `name: 'App'` to component definition

## Component Migration Checklist

### Template Changes
- [ ] Replace `v-slot` with `#` shorthand where appropriate
- [ ] Update event handling syntax if needed
- [ ] Check for deprecated Vuetify 2 props/components

### Script Changes
- [ ] Ensure all components use Options API (not setup function)
- [ ] Update any Vue 2 specific syntax
- [ ] Check for deprecated lifecycle hooks

### Style Changes
- [ ] Update any Vuetify 2 specific CSS classes
- [ ] Check for deprecated theme variables

## Common Issues and Solutions

### 1. Event Bus
The event bus has been updated to work with Vue 3. Use the new EventBus from main.js.

### 2. Vuetify Components
Most Vuetify components work the same way, but some props may have changed. Check the Vuetify 3 documentation for specific components.

### 3. Router Navigation
Router navigation syntax remains the same, but the router instance is created differently.

### 4. Store Access
Store access syntax remains the same in components.

## Testing Checklist
- [ ] All routes work correctly
- [ ] All components render properly
- [ ] All forms submit correctly
- [ ] All dialogs open/close properly
- [ ] All data tables display correctly
- [ ] All charts render properly
- [ ] All file uploads work
- [ ] All API calls work
- [ ] All authentication flows work

## Next Steps
1. Run `npm install` to install new dependencies
2. Test the application thoroughly
3. Update any remaining components that need migration
4. Check for any console errors and fix them
5. Update any custom components that may not be compatible

## Notes
- This migration preserves the Options API approach as requested
- All existing functionality should work the same way
- Some third-party libraries may need updates for Vue 3 compatibility
- Test thoroughly in development before deploying to production 