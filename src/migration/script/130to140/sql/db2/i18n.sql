rename table ${SCHEMA_NAME}.i18n to i18n@BACKUP_TABLE_SUFFIX@;

create table ${SCHEMA_NAME}.i18n (
  type varchar(32) not null,
  id varchar(512) not null,
  country varchar(5) not null,
  lang varchar(5) not null,
  message varchar(2048) not null,
  primary key (type, id, country, lang)
) compress yes;

insert into ${SCHEMA_NAME}.i18n ( type,id,lang,country,message )
	select
		type,
		id,
		lang,
		country,
		message
	from
		${SCHEMA_NAME}.i18n@BACKUP_TABLE_SUFFIX@
	where
		type not in(
			'js',
			'widget'
		);
