/**
 * Created by jmunoza on 11/10/16.
 */
//Do setup work here
"use strict";

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectID = require('mongodb').ObjectID;
var microActionCollectionName = 'microaction';
var dataService = require('services/dataService');

var microActionSchema = {
  name: String,
  note: String,
  //material component - material agency
  items: [{
    name: String,
    path: {type: String, unique: true},
    handler: String,
    token: String,
    status: String
  }],
  // social component - social agency
  agents: [{
    user: Schema.Types.ObjectId,
    email: String,
    name: String,
    role: String,
    beginsAt: Date,
    endsAt: Date,
    status: String
  }],
  // temporal component
  time: {
    creationDate: Date,
    lastModified: Date,
    beginsAt: Date,
    endsAt: Date,
    timeZone: String,
    now: Boolean
  },
  //subevents - complex events
  subEvents: [{
    event: Schema.Types.ObjectId, //microaction_id
    name: String,
    note: String,
    agents: [{
      user: Schema.Types.ObjectId,
      email: String,
      name: String
    }],
    status: String,
    beginsAt: Date,
    endsAt: Date,
    now: Boolean
  }],
  //other metadata
  tags: [{
    name: String,
    user: Schema.Types.ObjectId,
    creationDate: Date
  }],
  status: String,
  // spatial agency
  geoLocation : [{}]
};

mongoose.model(microActionCollectionName, new Schema(microActionSchema));

var MicroAction;
MicroAction = function MicroAction(properties){
  var context = this;

  if (properties._id) {
    if (typeof properties._id.toHexString === 'function') {
      context._id = properties._id.toHexString();
    }
    else{
      context._id = properties._id;
    }
  }

  Object.keys(microActionSchema).forEach(function (key) {
    if (properties.hasOwnProperty(key)) {
      context[key] = properties[key];
    }
  });

  context.time.creationDate = context.time.creationDate || new Date();
  context.time.lastModified = context.time.lastModified || context.time.creationDate;

};

//public methods

/** Instance saves itself into DB document (aka: upsert) */
MicroAction.prototype.save = function save(callback) {
  var context = this;

  MicroAction.validateSchemaProperties(context, function(err, properties){

    if (context._id) {
      properties._id = new ObjectId(context._id);
    }
    properties.lastModified = new Date();
    dataService.insertObject(
      microActionCollectionName,
      properties,
      function(err, microAction){
        if (microAction) {
          context._id = microAction._id.toHexString();
          return callback(null, new MicroAction(microAction.toObject()));
        }
        else return (err);
      });
  });
};

/** Instance saves specific properties (changes) into the
 * existing DB document (update) */
MicroAction.prototype.update = function update(properties, callback) {
  var context = this;
  var ObjectId = require('mongodb').ObjectID;
  properties.lastModified = new Date();
  dataService.findAndUpdateObject(microActionCollectionName, {
      _id: new ObjectId(context._id)},
    properties, function (err, microAction) {
      if(microAction){
        return callback(null, new MicroAction(microAction.toObject()));
      }
      else return callback(err);
    });
};

/** Instance deletes itself from the DB (delete) */
MicroAction.prototype.deleteInstance = function deleteInstance(callback) {
  //TODO some stuff here
  return callback();
};

MicroAction.prototype.containsMember = function containsMember(userId, callback){
  var context = this;
  context.agents.forEach(function(key){
    if(key.user === userId) return callback(null, true);
    else return callback(null, false);
  });
  /*dataService.getObject(microActionCollectionName, {
   _id : new ObjectId(context._id),
   'agents.user' : userId
   }, function (err, microAction) {
   if (microAction)
   callback(err, true);
   else callback(err, false);
   });*/
};

MicroAction.prototype.addItem = function addItem(item, callback) {
  var context = this;
  var ObjectId = require('mongodb').ObjectID;
  dataService.insertUniqueInternalObject(microActionCollectionName,
    {
      _id: new ObjectId(microActionId)
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

MicroAction.prototype.removeTrackedItem = function removeTrackedItem(item, callback) {
  var context = this;
  var ObjectId = require('mongodb').ObjectID;
  dataService.removeObject(microActionCollectionName,
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
        MicroAction.getByID(context._id, function (err, microAction) {
          return callback(err, new MicroAction(microAction.toObject()));
        });
      }
      else return callback(err);
    });
};



MicroAction.prototype.addMember = function addMember(ownerId, email, callback) {
  var context = this;
  var ObjectId = require('mongodb').ObjectID;
  var newMember = {
    user: 0,
    email: email,
    role: context.ROLES.READER
  };
  dataService.insertUniqueInternalObject(microActionCollectionName,
    {
      _id: new ObjectId(context._id),
      'agents.user': ownerId,
      'agents.role': context.ROLES.OWNER
    },
    newMember,
    function (err, num) {
      if(num){
        context.agents.push(newMember);
        callback(null, context);
      }
      else callback(err);
    });
};

MicroAction.prototype.removeMember = function removeMember(ownerId, email, callback) {
  var context = this;
  var ObjectId = require('mongodb').ObjectID;
  dataService.removeObject(microActionCollectionName,
    {
      _id: new ObjectId(context._id),
      'agents.user': ownerId,
      'agents.role': MicroAction.ROLES.OWNER
    },
    {
      members: {email: email}
    },
    function (err, num) {
      if(num){
        var index = 0;
        context.members.forEach(function(member){
          if(member.email === email) {
            context.agents.splice(index, 1);
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
MicroAction.getByID = function getByID(id, callback) {
  var ObjectId = require('mongodb').ObjectID;
  dataService.getObject(
    microActionCollectionName, {_id: new ObjectId(id)},
    function (err, microAction) {
      if (microAction) {
        return callback(null, new MicroAction(microAction.toObject()));
      }
      else {
        return callback(err);
      }
    });
};

MicroAction.getByName = function getByName(microActionName, callback) {
  dataService.getObject(
    microActionCollectionName,
    {
      name: microActionName
    },
    function (err, microAction) {
      if (microAction) {
        return callback(err, new MicroAction(microAction.toObject()));
      }
      else return callback(err);
    });
};

MicroAction.getByIDAndUserID = function getByIDAndUserID(id, userId, callback) {
  var ObjectId = require('mongodb').ObjectID;
  dataService.getObject(
    microActionCollectionName, {
      _id: new ObjectId(id),
      'agents.user' : userId
    },
    function (err, microAction) {
      if (microAction) {
        return callback(null, new MicroAction(microAction.toObject()));
      }
      else {
        return callback(err);
      }
    });
};

MicroAction.getMicroActionsOwnedByUser = function getMicroActionsOwnedBy(userId, callback){
  var context = this;
  dataService.getObject(microActionCollectionName, {
    'agents.user': userId,
    'agents.role': context.ROLES.OWNER
  }, function(err, microAction){
    if(microAction){
      return callback(null,  new MicroAction(microAction.toObject()));
    }
    return callback(err);
  });
};

MicroAction.getMicroActionsByUser = function getMicroActionsByUser(userId, callback){
  dataService.find(microActionCollectionName, {
    'agents.user': userId
  }, function(err, res){
    if(res){
      var microActions = {};
      res.forEach(function(microAction){
        microActions.push(new MicroAction(res[microAction].toObject()));
      });
      return callback(null, microActions);
    }
    else return callback(err);
  });
};

MicroAction.setUserIdToMicroAction = function setUserIdToMicroActions(email, userId, callback) {
  dataService.updateObject(microActionCollectionName, {'agents.email' : email}, {'agents.$.user' : userId}, function (err, num) {
    callback(err, num);
  });
};

MicroAction.validateSchemaProperties = function validateSchemaProperties(properties, callback){
  var validProperties = {};
  Object.keys(microActionSchema).forEach(function (key) {
    if (properties.hasOwnProperty(key)) {
      validProperties[key] = properties[key];
    }
  });

  return callback(null, validProperties);
};

MicroAction.DEFAULT_CATEGORIES = {
  white : 'white',
  red : 'red',
  blue : 'blue',
  green : 'green',
  purple : 'purple'
};

MicroAction.ROLES = {
  OWNER : 'owner',
  RECEIVER: 'receiver',
  READER : 'reader'
};

MicroAction.STATUS = {
  DELETED : 'deleted',
  ACTIVE: 'active',
  INACTIVE: 'inactive'
};


module.exports = MicroAction;
