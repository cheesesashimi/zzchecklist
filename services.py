from google.appengine.ext import ndb
from protorpc import messages
from protorpc import message_types
from protorpc import remote
from protorpc.wsgi import service
import models
import protorpc_messages
import logging


class ChecklistService(remote.Service):
  """Provides an AJAX API.
  """
  @remote.method(protorpc_messages.ChecklistItemMessageUpdate,
                 protorpc_messages.ChecklistItemMessageUpdate)
  def CreateItem(self, request):
    """Creates a new item in the datastore.

    Args:
      request; ChecklistItemMessageUpdate; a ProtoRPC message.

    Returns:
      An updated ChecklistITemMessageUpdate message.
    """
    item = models.ChecklistItem()
    item.FromRpcMessage(request.checklist_item)
    item.put()

    request.checklist_item = item.ToRpcMessage()
    return request

  @remote.method(protorpc_messages.ChecklistItemMessageUpdate,
                 message_types.VoidMessage)
  def DeleteItem(self, request):
    """Deletes an item from the datastore.

    Args:
      request; ChecklistItemMessageUpdate; a ProtoRPC message.

    Returns:
      A VoidMessage instance since ProtoRPC cannot return None.
    """ 
    ndb.Key(urlsafe=request.checklist_item.key).delete()
    return message_types.VoidMessage()

  @remote.method(protorpc_messages.ChecklistItemMessageUpdate,
                 protorpc_messages.ChecklistItemMessageUpdate)
  def UpdateItem(self, request):
    """Updates an item in the datastore.

    Args:
      request; ChecklistItemMessageUpdate; a ProtoRPC message.

    Returns:
      An updated ChecklistITemMessageUpdate message.
    """ 
    item = ndb.Key(urlsafe=request.checklist_item.key).get()
    if item:
      item.FromRpcMessage(request.checklist_item)
      item.put()
      request.checklist_item = item.ToRpcMessage()
      return request

  @remote.method(message_types.VoidMessage, protorpc_messages.ChecklistItems)
  def GetAllItems(self, request):
    """Gets all items from the datastore with a limit of 1000 items.

    Args:
      request; VoidMessage: A VoidMessage instance.

    Returns:
      A populated ChecklistItems ProtoRPC response message.
    """
    response = protorpc_messages.ChecklistItems()
    query = models.ChecklistItem().query()
    response.checklist_items = [item.ToRpcMessage()
                                for item in query.fetch(limit=1000)]
    return response

app = service.service_mappings([('/ChecklistService', ChecklistService)])
