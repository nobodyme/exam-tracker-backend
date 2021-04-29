'use strict';

const aws = require('aws-sdk');
aws.config.update({ region: 'us-east-1' });
const dynamodb = new aws.DynamoDB.DocumentClient();
const { TYPES } = require('./constants');

const tableName = process.env.ExamDetailTable;

console.debug('tableName', tableName);

module.exports.logDetails = async (event) => {
  /**
   * debug logs
   */
  const body = JSON.parse(event.body);
  console.debug('body', body);

  const { type, email, url } = body;

  let putItem = {};

  const { Item } = await dynamodb.get({
    TableName: tableName,
    Key: {
      email: email
    },
  }).promise();

  console.debug('got item', Item);

  switch (type) {
    case TYPES.STARTED:
      putItem = {
        ...Item,
        email: email,
        started: new Date().toISOString()
      }
      break;
    case TYPES.NEW_TAB:
      putItem = {
        ...Item,
        newTab: Item.newTab ? Item.newTab + 1 : 1,
        url: Item.url ? [...Item.url, url] : [url]
      }
      break;
    case TYPES.WINDOW_CHANGE:
      putItem = {
        ...Item,
        windowChanged: Item.windowChanged ? Item.windowChanged + 1 : 1
      }
      break;
    case TYPES.COMPLETED:
      putItem = {
        ...Item,
        completed: new Date().toISOString()
      }
      break;
    default:
      // ignoring other types for now
  }

  console.debug('putItem', putItem);

  const result = await dynamodb.put({
    TableName: tableName,
    Item: putItem
  }).promise();

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        result: 'done'
      },
      null,
      2
    ),
  };
};
