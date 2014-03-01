from google.appengine.ext import ndb
from protorpc import messages
from protorpc import message_types
from protorpc import remote
from protorpc.wsgi import service
import models
import protorpc_messages
import logging


class ChecklistService(remote.Service):
  @remote.method(protorpc_messages.ChecklistItemMessageUpdate,
                 protorpc_messages.ChecklistItemMessageUpdate)
  def CreateItem(self, request):
    item = models.ChecklistItem()
    item.FromRpcMessage(request.checklist_item)
    item.put()

    request.checklist_item = item.ToRpcMessage()
    return request

  @remote.method(protorpc_messages.ChecklistItemMessageUpdate,
                 message_types.VoidMessage)
  def DeleteItem(self, request):
    ndb.Key(urlsafe=request.checklist_item.key).delete()
    return message_types.VoidMessage()

  @remote.method(protorpc_messages.ChecklistItemMessageUpdate,
                 protorpc_messages.ChecklistItemMessageUpdate)
  def UpdateItem(self, request):
    item = ndb.Key(urlsafe=request.checklist_item.key).get()
    if item:
      item.FromRpcMessage(request.checklist_item)
      item.put()
      request.checklist_item = item.ToRpcMessage()
      return request

  @remote.method(protorpc_messages.ChecklistKey,
                 protorpc_messages.ChecklistItemMessage)
  def GetByKey(self, request):
    item = ndb.Key(urlsafe=request.key).get()
    if item:
      return item.ToRpcMessage()

  @remote.method(message_types.VoidMessage, protorpc_messages.ChecklistItems)
  def GetAllItems(self, request):
    response = protorpc_messages.ChecklistItems()
    query = models.ChecklistItem().query()
    response.checklist_items = [item.ToRpcMessage()
                                for item in query.fetch(limit=1000)]
    return response

app = service.service_mappings([('/ChecklistService', ChecklistService)])
