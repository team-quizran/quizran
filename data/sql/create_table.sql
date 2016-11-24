-- アイテム
create table m_item (
  item_id serial not null
  , short_id text not null UNIQUE
  , rarity smallint not null
  , sort_key integer not null
  , puzzle_rows integer not null
  , puzzle_columns integer not null
  , name text not null
  , description text not null
  , ido text
  , keido text
  , ref_url_title text
  , ref_url text
  , ref_image_title text
  , ref_image text
  , create_user text not null
  , create_date timestamp not null
  , update_user text
  , update_date timestamp
  , constraint item_PKC primary key (item_id)
) ;

-- アイテムのパズル
create table m_puzzle_item (
  puzzle_item_id serial not null
  , item_id integer not null
  , short_id text not null UNIQUE
  , rarity smallint not null
  , sort_key integer not null
  , create_date timestamp not null
  , create_user text not null
  , update_date timestamp
  , update_user text
  , constraint puzzle_item_PKC primary key (puzzle_item_id)
) ;

-- クイズ
create table m_quiz (
  quiz_id serial not null
  , sentence text not null
  , choices jsonb not null
  , correct_number smallint not null
  , level smallint not null
  , description text not null
  , ref_url text not null
  , create_date timestamp not null
  , create_user text not null
  , update_date timestamp
  , update_user text
  , constraint quiz_PKC primary key (quiz_id)
) ;

-- ユーザ
create table t_account (
  account_id serial not null
  , username text UNIQUE
  , password text not null
  , display_name text not null
  , point integer not null DEFAULT 0
  , last_login_date timestamp
  , last_free_gacha_time timestamp DEFAULT '1970/1/1'
  , create_date timestamp not null DEFAULT CURRENT_TIMESTAMP
  , update_date timestamp not null DEFAULT CURRENT_TIMESTAMP
  , constraint account_PKC primary key (account_id)
) ;

-- コレクション
create table t_collection (
  collection_id bigserial not null
  , account_id integer not null
  , puzzle_item_id integer not null
  , count integer not null DEFAULT 1
  , create_date timestamp not null DEFAULT CURRENT_TIMESTAMP
  , constraint collection_PKC primary key (collection_id)
) ;
