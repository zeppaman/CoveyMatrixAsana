/**
 * index.js
 * - All our useful JS goes here, awesome!
 */

// Init Vue!
var app = new Vue({

  el: '#demo',
	mounted: function () {
   this.displayData= new Array();
    this.displayData.isInited=false;
    
  },
    methods: {
        loadTasks:function(event)
        {

         var self = this;
          var client = Asana.Client.create().useAccessToken(this.pat);
          client.users.me()
            .then(function(meReq) {
         // console.log("user","done");
              self.currentUser=meReq;
            self.defaultWorkspace=self.currentUser.workspaces[0];
            
              client.tags.findByWorkspace( self.defaultWorkspace.id,{archived:false})
                          .then(function(tags) {
               // console.log("findByWorkspace","done");
                            self.tags=tags;
                           
                            self.tags.data.forEach(function(element) {
                                console.log(element.name.toLowerCase());
                              if(element.name.toLowerCase()=="important")
                              {
                                console.log("found!!!");
                                self.importantTag=element;
                              }
                              
                              
                              if(element.name.toLowerCase()=="urgent")
                              {
                                console.log("found!!!");
                                self.urgentTag=element;
                              }
                           
                              console.log(  self.importantTag);
                              
                            client.tasks.findAll({
                              workspace: self.defaultWorkspace.id,
                              assignee: self.currentUser.id,
                              opt_fields: 'id,name,assignee_status,completed,tags'})
                            .then(function(collection) {
                             // console.log("findAll","done");
                              //console.log(collection.data);
                              self.tasks=collection.data;
                              
                                self.uiTasks=new Array();
                                self.xiTasks=new Array();
                                self.uxTasks=new Array();
                                self.xxTasks=new Array();
                              
                                 self.displayData.items= new Array();
                               self.displayData.isInited=true;
                                
                                self.displayData.items.push(new Array());
                                self.displayData.items.push(new Array());
                                self.displayData.items.push(new Array());
                                self.displayData.items.push(new Array());
                              
                              collection.data.forEach(function(element) {
                              
                                let isImportant=self.containsTag(element,self.importantTag);
                                let isUrgent=self.containsTag(element,self.urgentTag);
                                
                                console.log(" =>",isImportant,isUrgent)
                             
                                
                                
                                
                                if(isImportant && isUrgent)
                                {
                                  self.uiTasks.push(element); 
                                  self.displayData.items[0].push(element); 
                                }
                                else if(!isImportant && !isUrgent)
                                {
                                  self.xxTasks.push(element);
                                   self.displayData.items[3].push(element);
                                }
                                 else if(isImportant )
                                {
                                  self.xiTasks.push(element);
                                  self.displayData.items[2].push(element); 
                                }
                                 else if(isUrgent)
                                {
                                   self.uxTasks.push(element);
                                   self.displayData.items[1].push(element);
                                }
                                
                                
                               
                                
                              });
                              
                              
                                
                               
                                app.$forceUpdate();
                                
                                
                            });

                        });
             
            });
             });
          },
      containsTag: function(task,tag)
      {
        let result=false;
         // console.log("containsTags", task.id, tag.id, task.tags)
        task.tags.forEach(function(element) {
        //  cosole.log("check", element.id, tag.id)
          if(element.id===tag.id)
            {
              console.log(task.name," IS ",tag.name)
              result= true;
            }
        });
        return result;
        
      },
    },
  
  data:{
    pat: '',
    currentUser:{
      email:"xxx",
    },
    defaultWorkspace:{},
    tags:[],
    urgentTag:{},
    importantTag:{},
    allTasks:[],
    colors: [
        { hex: "#f6d258" },
        { hex: "#efcec5" },
        { hex: "#d1af94" },
        { hex: "#97d5e0" },
      ],
    uiTasks:[],
    xiTasks:[],
    ixTaskx:[],
    xxTaskx:[],
    displayData:{isInited:false},
  },
   
  
})