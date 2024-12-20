CREATE SCHEMA IF NOT EXISTS web_app_kafka;

SET SCHEMA web_app_kafka;

CREATE TABLE IF NOT EXISTS http_service
(
    id          bigint       NOT NULL AUTO_INCREMENT,
    code        varchar(128) NOT NULL UNIQUE,
    created_at  timestamp    NOT NULL,
    modified_at timestamp    NOT NULL,
    CONSTRAINT http_service_pk PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS http_mock
(
    id           bigint        NOT NULL AUTO_INCREMENT,
    method       varchar(16)   NOT NULL,
    name         varchar(256)  NOT NULL,
    ant_pattern  varchar(2048) NOT NULL,
    service_id   bigint        NOT NULL,
    type         varchar(64)   NOT NULL,
    enabled      boolean       NOT NULL,
    storage_type varchar(64)   NOT NULL,
    storage_id   varchar(128)  NOT NULL,
    created_at   timestamp     NOT NULL,
    modified_at  timestamp     NOT NULL,
    CONSTRAINT http_mock_pk PRIMARY KEY (id),
    FOREIGN KEY (service_id) references http_service (id)
);
