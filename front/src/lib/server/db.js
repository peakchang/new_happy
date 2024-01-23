import mysql, { } from "mysql2"



export const sql_con = mysql.createConnection({
    host: import.meta.env.VITE_HOST || '127.0.0.1',
    user: 'root',
    password: import.meta.env.VITE_DBPWD,
    database: import.meta.env.VITE_SHEMA
})


/*
CREATE DATABASE happy_toad default CHARACTER SET UTF8;
CREATE DATABASE joy_shark default CHARACTER SET UTF8;

CREATE TABLE IF NOT EXISTS config(
    cf_name VARCHAR(100),
    cf_site VARCHAR(100),
    cf_base VARCHAR(10),
    cf_category VARCHAR(255),
    cf_menu VARCHAR(255),
    cf_pwd VARCHAR(255)
);

INSERT INTO config (cf_base,cf_category) VALUES ('base','유머,연예,IT,분양,기타');

CREATE TABLE IF NOT EXISTS board(
    bo_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    bo_category VARCHAR(255),
    bo_subject VARCHAR(255),
    bo_content TEXT,
    bo_keyword VARCHAR(255),
    bo_description VARCHAR(255),
    bo_created_at DATETIME,
    bo_updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS reply(
    re_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    re_type VARCHAR(50) NOT NULL,
    re_parent VARCHAR(10) NOT NULL,
    re_re_parent VARCHAR(10),
    re_ip VARCHAR(50),
    re_content TEXT NOT NULL,
    re_created_at DATETIME
);


*/