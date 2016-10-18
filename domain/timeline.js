/**
 * Created by jmunoza on 10/10/16.
 */
//Do setup work here
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timelineCollectionName = 'timeline';
var dataService = require('services/dataService');

var timelineSchema = {
  name: String,
  items: [{
    name: String,
    path: {type: String, unique: true},
    owner: String,
    app: String,
    token: String,
    status: String
  }],

  members: [{
    user: { type: String, unique: true },
    email: String,
    role: String,
    invitationDate: Date
  }],
  categories: {
    red: String,
    blue: String,
    green: String,
    purple: String
  },
  creationDate: Date,
  lastModified: Date,
  geoLocation : [{}]
};

mongoose.model(timelineCollectionName, new Schema(timelineSchema));

var Timeline;
Timeline = function Timeline(properties){
  var context = this;

  if (properties._id) {
    if (typeof properties._id.toHexString === 'function') {
      context._id = properties._id.toHexString();
    }
    else{
      context._id = properties._id;
    }
  }

  Object.keys(timelineSchema).forEach(function (key) {
    if (properties.hasOwnProperty(key)) {
      context[key] = properties[key];
    }
  });

  if(!properties.categories)
    context.categories = properties.categories || Timeline.DEFAULT_CATEGORIES;
  context.creationDate = context.creationDate || new Date();
  context.lastModified = context.lastModified || context.creationDate;

};

//public methods

/** Instance saves itself into DB document (aka: upsert) */
Timeline.prototype.save = function save(callback) {
  var context = this;

  Timeline.validateSchemaProperties(context, function(err, properties){

    if (context._id) {
      properties._id = new ObjectId(context._id);
    }
    properties.lastModified = new Date();
    dataService.insertObject(
      timelineCollectionName,
      properties,
      function(err, timeline){
        if (timeline) {
          context._id = timeline._id.toHexString();
          return callback(null, new Timeline(timeline.toObject()));
        }
        else return (err);
      });
  });
};

/** Instance saves specific properties (changes) into the
 * existing DB document (update) */
Timeline.prototype.update = function update(properties, callback) {
  var context = this;
  var ObjectId = require('mongodb').ObjectID;
  properties.lastModified = new Date();
  dataService.findAndUpdateObject(timelineCollectionName, {
      _id: new ObjectId(context._id)},
    properties, function (err, timeline) {
      if(timeline){
        return callback(null, new Timeline(timeline.toObject()));
      }
      else return callback(err);
    });
};

/** Instance deletes itself from the DB (delete) */
Timeline.prototype.deleteInstance = function deleteInstance(callback) {
  //TODO some stuff here
  return callback();
};

Timeline.prototype.containsMember = function containsMember(userId, callback){
  var context = this;
  context.members.forEach(function(key){
    if(key.user === userId) return callback(null, true);
    else return callback(null, false);
  });
  /*dataService.getObject(timelineCollectionName, {
   _id : new ObjectId(context._id),
   'members.user' : userId
   }, function (err, timeline) {
   if (timeline)
   callback(err, true);
   else callback(err, false);
   });*/
};

Timeline.prototype.addItem = function addItem(item, callback) {
  var context = this;
  var ObjectId = require('mongodb').ObjectID;
  dataService.insertUniqueInternalObject(timelineCollectionName,
    {
      _id: new ObjectId(timelineId)
    },
    {
      trackedItems: {
        name: item.name,
        path: item.path,
        owner: item.userId,
        app: item.app,
        token: item.token
      }
    },function (err, num) {
      if(num){
        context.trackedItems.push(item);
        callback(null, context);
      }
      else callback(err);
    });
};

Timeline.prototype.removeTrackedItem = function removeTrackedItem(item, callback) {
  var context = this;
  var ObjectId = require('mongodb').ObjectID;
  dataService.removeObject(timelineCollectionName,
    {
      _id: new ObjectId(context._id)
    },
    {
      trackedItems: {
        name: item.name,
        path: item.path,
        owner: item.userId,
        app: item.app
      }
    },function (err, num) {
      if(num) {
        Timeline.getByID(context._id, function (err, timeline) {
          return callback(err, new Timeline(timeline.toObject()));
        });
      }
      else return callback(err);
    });
};



Timeline.prototype.addMember = function addMember(ownerId, email, callback) {
  var context = this;
  var ObjectId = require('mongodb').ObjectID;
  var newMember = {
    user: 0,
    email: email,
    role: context.ROLES.READER
  };
  dataService.insertUniqueInternalObject(timelineCollectionName,
    {
      _id: new ObjectId(context._id),
      'members.user': ownerId,
      'members.role': context.ROLES.OWNER
    },
    newMember,
    function (err, num) {
      if(num){
        context.members.push(newMember);
        callback(null, context);
      }
      else callback(err);
    });
};

Timeline.prototype.removeMember = function removeMember(ownerId, email, callback) {
  var context = this;
  var ObjectId = require('mongodb').ObjectID;
  dataService.removeObject(timelineCollectionName,
    {
      _id: new ObjectId(context._id),
      'members.user': ownerId,
      'members.role': Timeline.ROLES.OWNER
    },
    {
      members: {email: email}
    },
    function (err, num) {
      if(num){
        var index = 0;
        context.members.forEach(function(member){
          if(member.email === email) {
            context.members.splice(index, 1);
          }
          index++;
        });
        return callback(null, context);
      }
      return callback(err, num);
    });
};

//static methods
//Data Access methods
Timeline.getByID = function getByID(id, callback) {
  var ObjectId = require('mongodb').ObjectID;
  dataService.getObject(
    timelineCollectionName, {_id: new ObjectId(id)},
    function (err, timeline) {
      if (timeline) {
        return callback(null, new Timeline(timeline.toObject()));
      }
      else {
        return callback(err);
      }
    });
};

Timeline.getByName = function getByName(timelineName, callback) {
  dataService.getObject(
    timelineCollectionName,
    {
      name: timelineName
    },
    function (err, timeline) {
      if (timeline) {
        return callback(err, new Timeline(timeline.toObject()));
      }
      else return callback(err);
    });
};

Timeline.getByIDAndUserID = function getByIDAndUserID(id, userId, callback) {
  var ObjectId = require('mongodb').ObjectID;
  dataService.getObject(
    timelineCollectionName, {
      _id: new ObjectId(id),
      'members.user' : userId
    },
    function (err, timeline) {
      if (timeline) {
        return callback(null, new Timeline(timeline.toObject()));
      }
      else {
        return callback(err);
      }
    });
};

Timeline.getTimelinesOwnedByUser = function getTimelinesOwnedBy(userId, callback){
  var context = this;
  dataService.getObject(timelineCollectionName, {
    'members.user': userId,
    'members.role': context.ROLES.OWNER
  }, function(err, timeline){
    if(timeline){
      return callback(null,  new Timeline(timeline.toObject()));
    }
    return callback(err);
  });
};

Timeline.getTimelinesByUser = function getTimelinesByUser(userId, callback){
  dataService.find(timelineCollectionName, {
    'members.user': userId
  }, function(err, res){
    if(res){
      var timelines = {};
      res.forEach(function(timeline){
        timelines.push(new Timeline(res[timeline].toObject()));
      });
      return callback(null, timelines);
    }
    else return callback(err);
  });
};

Timeline.setUserIdToTimeline = function setUserIdToTimelines(email, userId, callback) {
  dataService.updateObject(timelineCollectionName, {'members.email' : email}, {'members.$.user' : userId}, function (err, num) {
    callback(err, num);
  });
};

Timeline.validateSchemaProperties = function validateSchemaProperties(properties, callback){
  var validProperties = {};
  Object.keys(timelineSchema).forEach(function (key) {
    if (properties.hasOwnProperty(key)) {
      validProperties[key] = properties[key];
    }
  });

  return callback(null, validProperties);
};

Timeline.DEFAULT_CATEGORIES = {
  white : 'white',
  red : 'red',
  blue : 'blue',
  green : 'green',
  purple : 'purple'
};

Timeline.ROLES = {
  OWNER : 'owner',
  READER : 'reader'
};

module.exports = Timeline;
