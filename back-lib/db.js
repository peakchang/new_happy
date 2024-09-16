import mysql, { } from "mysql2"
import dotenv from "dotenv"
dotenv.config();


export const sql_con = mysql.createConnection({
    host: process.env.HOST || '127.0.0.1',
    user: 'root',
    password: process.env.DBPWD,
    database: process.env.SHEMA
})


/*

24-03-13
ALTER TABLE last_traffic_chk ADD COLUMN lt_use BOOL AFTER lt_last_time;
ALTER TABLE target DROP COLUMN tg_workbool;

ALTER TABLE target ADD COLUMN tg_workbool BOOLEAN DEFAULT TRUE AFTER tg_workcount;

CREATE TABLE IF NOT EXISTS used_news(
    un_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    un_content VARCHAR(255) NOT NULL UNIQUE
);



CREATE DATABASE happy_toad default CHARACTER SET UTF8;
CREATE DATABASE joy_shark default CHARACTER SET UTF8;

CREATE TABLE IF NOT EXISTS cafe_reply(
    cr_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cr_content VARCHAR(255) NOT NULL UNIQUE,
    cr_used BOOLEAN DEFAULT FALSE
);

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


CREATE TABLE IF NOT EXISTS target(
    tg_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tg_link VARCHAR(255),
    tg_keyword VARCHAR(100),
    tg_workcount INT(100) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS backlinks(
    bl_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    bl_link VARCHAR(255) UNIQUE,
    bl_status boolean DEFAULT true,
    bl_memo VARCHAR(255),
    bl_siteid VARCHAR(100),
    bl_sitepwd VARCHAR(100),
    bl_work_bool boolean DEFAULT FALSE
);

ALTER TABLE backlinks ADD COLUMN bl_work_bool boolean DEFAULT FALSE AFTER bl_sitepwd;
ALTER TABLE backlinks ADD COLUMN bl_editor VARCHAR(50) DEFAULT 'basic' AFTER bl_boardkey;

ALTER TABLE backlinks ADD COLUMN bl_write_btn_name boolean DEFAULT FALSE AFTER bl_memo;
ALTER TABLE backlinks ADD COLUMN bl_submit_name boolean DEFAULT FALSE AFTER bl_memo;

CREATE TABLE IF NOT EXISTS backlink_works(
    bw_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    bw_link VARCHAR(255),
    bw_target VARCHAR(150),
    bw_created_at DATETIME

);

ALTER TABLE backlink_works ADD COLUMN bw_count INT DEFAULT 0 AFTER bw_created_at;
ALTER TABLE backlink_works ADD COLUMN bw_target VARCHAR(150) AFTER bw_link;


CREATE TABLE IF NOT EXISTS nwork(
    n_idx INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    n_id VARCHAR(100) NOT NULL UNIQUE,
    n_pwd VARCHAR(100) NOT NULL,
    n_memo1 VARCHAR(255),
    n_memo2 VARCHAR(255),
    n_use BOOLEAN,
    n_blog_work BOOLEAN,
    n_blog_standby BOOLEAN,
    n_blog_any BOOLEAN,
    n_cafe BOOLEAN,
    n_kin BOOLEAN,
    n_ua INT,
    n_ch_profile INT,
    n_used BOOLEAN DEFAULT FALSE,
    n_lastwork_at DATETIME
);

ALTER TABLE nwork ADD COLUMN n_use BOOLEAN DEFAULT true AFTER n_memo2;
ALTER TABLE nwork ADD COLUMN n_cafe BOOLEAN AFTER n_blog_any;
ALTER TABLE nwork ADD COLUMN n_kin BOOLEAN AFTER n_cafe;
ALTER TABLE nwork ADD COLUMN n_used BOOLEAN DEFAULT FALSE AFTER n_ch_profile;



CREATE TABLE IF NOT EXISTS cafe_list(
    cl_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cl_link VARCHAR(255),
    cl_board_name VARCHAR(100),
    cl_board_num VARCHAR(10),
    cl_use BOOLEAN DEFAULT TRUE,
    cl_memo VARCHAR(255),
    cl_use_count INT DEFAULT 0
);

ALTER TABLE cafe_list ADD COLUMN cl_use_count INT AFTER cl_memo;

CREATE TABLE IF NOT EXISTS cafe_worklist(
    cw_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cw_link VARCHAR(255),
    cw_work_count INT DEFAULT 0,
    cw_worked_at DATETIME
);

ALTER TABLE cafe_worklist ADD COLUMN cw_work_count INT DEFAULT 0 AFTER cw_link;


CREATE TABLE IF NOT EXISTS site_traffic(
    st_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    st_link VARCHAR(255),
    st_relation_subject VARCHAR(255),
    st_subject VARCHAR(255),
    st_addlink VARCHAR(255),
    st_target_click_count INT DEFAULT 0,
    st_now_click_count INT DEFAULT 0,
    st_original_link VARCHAR(255),
    st_use BOOLEAN DEFAULT TRUE,
    st_work_type BOOL DEFAULT FALSE,
    st_correspond BOOL DEFAULT FALSE,
    st_memo TEXT
);

ALTER TABLE nwork ADD COLUMN n_use_com VARCHAR(50) AFTER n_used;

ALTER TABLE site_traffic_loop ADD COLUMN st_unique_link VARCHAR(255) AFTER st_memo;

ALTER TABLE site_traffic ADD COLUMN st_work_type BOOLEAN DEFAULT FALSE AFTER st_use;


ALTER TABLE site_traffic ADD COLUMN st_relation_subject VARCHAR(255) AFTER st_link;
ALTER TABLE site_traffic ADD COLUMN st_memo TEXT AFTER st_work_type;
ALTER TABLE site_traffic ADD COLUMN st_correspond BOOL DEFAULT FALSE AFTER st_work_type;

ALTER TABLE site_traffic ADD COLUMN st_memo TEXT AFTER st_work_type;



CREATE TABLE IF NOT EXISTS user_agent(
    ua_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    ua_content VARCHAR(255),
    ua_use BOOL DEFAULT TRUE
);



CREATE TABLE IF NOT EXISTS site_traffic_loop(
    st_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    st_link VARCHAR(255),
    st_subject VARCHAR(255),
    st_addlink VARCHAR(255),
    st_target_click_count VARCHAR(255) DEFAULT 0,
    st_now_click_count INT DEFAULT 0,
    st_click_obj TEXT,
    st_use BOOLEAN DEFAULT TRUE,
    st_work_type BOOLEAN DEFAULT FALSE,
    st_correspond BOOLEAN DEFAULT FALSE,
    st_click_bool BOOLEAN DEFAULT FALSE,
    st_rate_memo TEXT,
    st_memo TEXT
);





ALTER TABLE site_traffic_loop ADD COLUMN st_group VARCHAR(50) AFTER st_correspond;

ALTER TABLE site_traffic_loop ADD COLUMN st_work_type2 VARCHAR(10) AFTER st_work_type;

CREATE TABLE IF NOT EXISTS last_traffic_chk(
    lt_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    lt_name VARCHAR(50),
    lt_last_time DATETIME
);




CREATE TABLE IF NOT EXISTS site_traffic_plz(
    st_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    st_link VARCHAR(255),
    st_subject VARCHAR(255),
    st_addlink VARCHAR(255),
    st_target_click_count VARCHAR(255) DEFAULT 0,
    st_now_click_count INT DEFAULT 0,
    st_click_obj TEXT,
    st_cafe_work BOOLEAN DEFAULT FALSE,
    st_use BOOLEAN DEFAULT TRUE,
    st_click_status BOOLEAN DEFAULT FALSE,
    st_unique_link varchar(255)
);


ALTER TABLE site_traffic_plz ADD COLUMN st_group VARCHAR(100) AFTER st_click_status;
ALTER TABLE site_traffic_plz ADD COLUMN st_expose_count INT AFTER st_click_status;
ALTER TABLE site_traffic_plz DROP COLUMN st_click_obj;




CREATE TABLE IF NOT EXISTS pre_keyword(
    pk_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    pk_content VARCHAR(255),
    pk_group VARCHAR(10),
    pk_use BOOL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS profile_list(
    pl_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    pl_name VARCHAR(50),
    pl_number VARCHAR(50),
    pl_n_id VARCHAR(50),
    pl_n_pwd VARCHAR(100),
    pl_ua_num VARCHAR(5),
    pl_lastworked_at DATETIME,
    UNIQUE (pl_name, pl_number)
);

ALTER TABLE profile_list ADD COLUMN pl_work_status BOOLEAN DEFAULT FALSE AFTER pl_ua_num;
ALTER TABLE profile_list ADD COLUMN pl_work_count INT DEFAULT 0 AFTER pl_ua_num;

CREATE TABLE IF NOT EXISTS profile(
    pr_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    pr_name VARCHAR(50) UNIQUE,
    pr_work_status VARCHAR(50),
    pr_reset_status BOOLEAN DEFAULT FALSE
);


// 0902 DB 추가할 내용들
ALTER TABLE profile ADD COLUMN pr_work_type VARCHAR(100) AFTER pr_work_status;
ALTER TABLE profile ADD COLUMN pr_group VARCHAR(10) AFTER pr_work_status;

ALTER TABLE site_traffic_plz ADD COLUMN st_group VARCHAR(100) AFTER st_click_status;
ALTER TABLE site_traffic_plz ADD COLUMN st_expose_count INT DEFAULT 0 AFTER st_click_status;
ALTER TABLE site_traffic_plz DROP COLUMN st_click_obj;

// 0905 DB 추가할 내용들
ALTER TABLE site_traffic_plz ADD COLUMN st_same_link BOOLEAN DEFAULT FALSE AFTER st_click_status;

ALTER TABLE target ADD CONSTRAINT 제약조건이름 UNIQUE (열이름);


ALTER TABLE target ADD CONSTRAINT tg_link UNIQUE (tg_link);



// 0916 추가할 내용
ALTER TABLE backlinks ADD COLUMN bl_write_btn_name VARCHAR(100) AFTER bl_memo;
ALTER TABLE backlinks ADD COLUMN bl_submit_name VARCHAR(100) AFTER bl_memo;

*/