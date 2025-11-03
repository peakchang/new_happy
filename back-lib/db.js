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

ALTER TABLE config ADD COLUMN cf_webclass VARCHAR(255);

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


ALTER TABLE nwork ADD COLUMN n_work_count INT DEFAULT 0 AFTER n_link_use;


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
ALTER TABLE site_traffic_plz DROP COLUMN st_real_work_status;

ALTER TABLE site_traffic_plz ADD COLUMN st_realclick_status BOOLEAN DEFAULT FALSE AFTER st_click_status;

// 11/12 추가추가
ALTER TABLE site_traffic_plz ADD COLUMN st_m_realclick_status BOOLEAN DEFAULT FALSE AFTER st_realclick_status;


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
    pl_work_count INT DEFAULT 0,
    pl_work_status BOOLEAN DEFAULT FALSE,
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



// 0916 추가할 내용
ALTER TABLE backlinks ADD COLUMN bl_write_btn_name VARCHAR(100) AFTER bl_memo;
ALTER TABLE backlinks ADD COLUMN bl_submit_name VARCHAR(100) AFTER bl_memo;

// 0918 추가할 내용
ALTER TABLE backlink_works ADD COLUMN bw_target VARCHAR(150) AFTER bw_link;
ALTER TABLE backlinks ADD COLUMN bl_add_script TEXT AFTER bl_memo;

ALTER TABLE backlinks ADD COLUMN bl_priority_work BOOLEAN AFTER bl_work_bool;


24 / 11 /22 추가추가!!!
ALTER TABLE nwork ADD COLUMN n_blog_order INT UNIQUE AFTER n_use_com;


ALTER TABLE nwork ADD COLUMN n_link_use BOOLEAN AFTER n_blog_order;


ALTER TABLE profile_list ADD CONSTRAINT profile_unique UNIQUE (pl_name);



CREATE TABLE IF NOT EXISTS cafe_ready(
    cr_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    cr_n_idx VARCHAR(255) NOT NULL,
    cr_cafe_idx VARCHAR(255) NOT NULL,
    cr_subjectlist TEXT,
    cr_work_date DATETIME,
    cr_content_type VARCHAR(255),
    cr_content0 TEXT,
    cr_content1 TEXT,
    cr_content2 TEXT,
    cr_content3 TEXT,
    cr_content4 TEXT,
    cr_content5 TEXT,
    cr_content6 TEXT,
    cr_content7 TEXT,
    cr_content8 TEXT,
    cr_content9 TEXT
);

ALTER TABLE profile_list ADD COLUMN pl_work_type VARCHAR(30) AFTER pl_work_status;



CREATE TABLE IF NOT EXISTS target(
    tg_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tg_link VARCHAR(255),
    tg_keyword VARCHAR(100),
    tg_workcount INT DEFAULT 0,
    tg_workbool BOOLEAN DEFAULT TRUE,
    tg_blog_work_count INT(100) DEFAULT 0,
    tg_blog_work_bool BOOLEAN DEFAULT TRUE,
    tg_blog_used BOOLEAN DEFAULT FALSE,
    tg_group VARCHAR(10),
    UNIQUE (tg_link, tg_keyword)
);

ALTER TABLE target ADD COLUMN tg_group VARCHAR(10) AFTER tg_blog_used;

// 0421 수정수정
ALTER TABLE target DROP COLUMN tg_used;
ALTER TABLE backlinks DROP COLUMN bl_write_btn_name;
ALTER TABLE backlinks DROP COLUMN bl_submit_name;
ALTER TABLE backlinks DROP COLUMN bl_priority_work;
ALTER TABLE backlinks DROP COLUMN bl_work_bool;


ALTER TABLE target ADD COLUMN tg_used BOOLEAN DEFAULT FALSE AFTER tg_workbool;
ALTER TABLE backlinks ADD COLUMN bl_board VARCHAR(100) AFTER bl_link;
ALTER TABLE backlinks ADD COLUMN bl_work_bool BOOLEAN DEFAULT FALSE AFTER bl_status;
ALTER TABLE backlinks ADD COLUMN bl_problem BOOLEAN DEFAULT FALSE AFTER bl_work_bool ;


0422 수정 수정
DROP TABLE backlink_works;

CREATE TABLE IF NOT EXISTS backlink_last(
    id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    bl_last_work_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    bl_pc_id VARCHAR(100)
);


ALTER TABLE backlinks ADD COLUMN bl_test BOOLEAN DEFAULT FALSE AFTER bl_problem;




CREATE TABLE IF NOT EXISTS site_rate (
    sr_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    sr_site_id VARCHAR(10),
    sr_rate VARCHAR(100),
    sr_unique INT,
    sr_created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (sr_site_id, sr_rate, sr_unique)
);

CREATE INDEX idx_site_rate_site_created ON site_rate (sr_site_id, sr_created_at DESC);

st_expose_bool // 노출 여부 (노출이 되어 있는지 안되어 있는지)
st_expose_status // 노출 작업 여부 (노출 작업을 했는지 안했는지)

CREATE TABLE IF NOT EXISTS site_traffic_work(
    st_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    st_link VARCHAR(255),
    st_subject VARCHAR(255),
    st_expose_count INT DEFAULT 0,
    st_target_click_count VARCHAR(255) DEFAULT 0,
    st_now_click_count INT DEFAULT 0,
    st_group VARCHAR(10),
    st_use BOOLEAN DEFAULT TRUE,
    st_same_link BOOLEAN DEFAULT TRUE,
    st_expose_bool BOOLEAN DEFAULT TRUE,
    st_expose_status BOOLEAN DEFAULT FALSE,
    st_pc_click_status BOOLEAN DEFAULT FALSE,
    st_m_click_status BOOLEAN DEFAULT FALSE,
    st_created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);


*/