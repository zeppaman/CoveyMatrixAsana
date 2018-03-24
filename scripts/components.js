/**
 * Register Vue Components
 */

// register the grid component
// Vue.component('page-head', {
//   template: '#page-head'
// })

Vue.component('quadrant', 
{
  template: '#quadrant-template',
  props: ['index','color','tasks'],
  methods: {
    closeTask(item) {
     
      app.$emit('closeTask',item);
    },
  },

})



