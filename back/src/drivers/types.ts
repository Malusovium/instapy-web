type CONNECTION_UID =
  string

type InternalDATA =
  { _UID: CONNECTION_UID
  , _to?: 'ALL' | 'SELF'
  , _show?: boolean
  }

type InternalSelf =
  { _self: InternalDATA }

export
  { CONNECTION_UID
  , InternalDATA
  , InternalSelf
  }
