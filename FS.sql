-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: fs
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `config`
--

DROP TABLE IF EXISTS `config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `config` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(100) NOT NULL COMMENT '配置参数名称',
  `value` varchar(100) DEFAULT NULL COMMENT '配置参数值',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb3 COMMENT='配置文件';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `config`
--

LOCK TABLES `config` WRITE;
/*!40000 ALTER TABLE `config` DISABLE KEYS */;
INSERT INTO `config` VALUES (1,'人气披萨推荐','/api/upload/banner1.jpg'),(2,'街头卤味精选','/api/upload/banner2.jpg'),(3,'招牌肉蟹煲','/api/upload/banner3.jpg'),(7,'新鲜刺身上新','/api/upload/banner4.jpg');
/*!40000 ALTER TABLE `config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `defaultuser`
--

DROP TABLE IF EXISTS `defaultuser`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `defaultuser` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `addtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `username` varchar(200) NOT NULL COMMENT '用户名',
  `mima` varchar(200) NOT NULL COMMENT '密码',
  `name` varchar(200) DEFAULT NULL COMMENT '姓名',
  `sex` varchar(200) DEFAULT NULL COMMENT '性别',
  `age` int DEFAULT NULL COMMENT '年龄',
  `phone` varchar(200) DEFAULT NULL COMMENT '电话',
  `picture` varchar(200) DEFAULT NULL COMMENT '照片',
  `email` varchar(200) DEFAULT NULL COMMENT '邮箱',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8mb3 COMMENT='注册用户';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `defaultuser`
--

LOCK TABLES `defaultuser` WRITE;
/*!40000 ALTER TABLE `defaultuser` DISABLE KEYS */;
INSERT INTO `defaultuser` VALUES (41,'2026-08-23 03:17:36','用户名1','$2b$10$V.33Zwo5eI9OxsFZ407q1O4hoYZRuu.vV0kes04MQQstaDZqvw/Xq','苏念安','女',21,'0731-88812001','/api/upload/yonghu_zhaopian1.jpg','user1@example.com'),(42,'2026-08-23 03:17:36','用户名2','$2b$10$V.33Zwo5eI9OxsFZ407q1O4hoYZRuu.vV0kes04MQQstaDZqvw/Xq','许星辞','男',22,'0731-88812002','/api/upload/yonghu_zhaopian2.jpg','user2@example.com'),(43,'2026-08-23 03:17:36','用户名3','$2b$10$V.33Zwo5eI9OxsFZ407q1O4hoYZRuu.vV0kes04MQQstaDZqvw/Xq','孟晚棠','女',20,'0731-88812003','/api/upload/yonghu_zhaopian3.jpg','user3@example.com'),(44,'2026-08-23 03:17:36','用户名4','$2b$10$V.33Zwo5eI9OxsFZ407q1O4hoYZRuu.vV0kes04MQQstaDZqvw/Xq','陆则言','男',23,'0731-88812004','/api/upload/yonghu_zhaopian4.jpg','user4@example.com'),(45,'2026-08-23 03:17:36','用户名5','$2b$10$V.33Zwo5eI9OxsFZ407q1O4hoYZRuu.vV0kes04MQQstaDZqvw/Xq','宋清和','女',21,'0731-88812005','/api/upload/yonghu_zhaopian5.jpg','user5@example.com'),(46,'2026-08-23 03:17:36','用户名6','$2b$10$V.33Zwo5eI9OxsFZ407q1O4hoYZRuu.vV0kes04MQQstaDZqvw/Xq','祁司远','男',24,'0731-88812006','/api/upload/yonghu_zhaopian6.jpg','user6@example.com');
/*!40000 ALTER TABLE `defaultuser` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `discussmeishijianshang`
--

DROP TABLE IF EXISTS `discussmeishijianshang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `discussmeishijianshang` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `addtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `refid` bigint NOT NULL COMMENT '关联表id',
  `userid` bigint NOT NULL COMMENT '用户id',
  `nickname` varchar(200) DEFAULT NULL COMMENT '用户名',
  `content` longtext NOT NULL COMMENT '评论内容',
  `reply` longtext COMMENT '回复内容',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1380000000197 DEFAULT CHARSET=utf8mb3 COMMENT='美食鉴赏评论表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `discussmeishijianshang`
--

LOCK TABLES `discussmeishijianshang` WRITE;
/*!40000 ALTER TABLE `discussmeishijianshang` DISABLE KEYS */;
INSERT INTO `discussmeishijianshang` VALUES (61,'2026-08-23 03:17:36',22,11,'林晚秋','鱼片厚度很实在，入口冰凉鲜甜，醋饭比例也好。','感谢喜欢，建议工作日下午来，不用排队。'),(62,'2026-08-23 03:17:36',23,13,'沈亦然','猪蹄卤得软糯，芝麻香气很足，打包回宿舍也没变味。',NULL),(63,'2026-08-23 03:17:36',24,14,'顾青野','鸡爪炖到脱骨，酱汁拌年糕最好吃，两个人吃分量很够。','可以选微辣，汤底不会太咸。'),(64,'2026-08-23 03:17:36',25,15,'陈知遥','饼底边缘有焦香，蘑菇和黑橄榄给得很足，性价比不错。',NULL),(65,'2026-08-23 03:17:36',26,16,'江叙白','泡椒味很正，牛蛙没有腥气，豆花吸满汤汁是亮点。','怕辣可以加一份豆花缓冲。'),(66,'2026-08-23 03:17:36',27,1380000000209,'李清让','奶油很轻，花纹好看，适合生日或下午茶拍照。',NULL),(1380000000316,'2026-08-23 03:17:36',26,1380000000209,'李清让','蛙肉弹嫩，酸辣度平衡，配米饭特别下饭。',NULL),(1380000000196,'2026-08-23 03:17:36',22,1380000000465,'周砚礼','刺身新鲜，摆盘干净，价格在这个分量里算合理。',NULL);
/*!40000 ALTER TABLE `discussmeishijianshang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `meishijianshang`
--

DROP TABLE IF EXISTS `meishijianshang`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `meishijianshang` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `addtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `fabushijian` date DEFAULT NULL COMMENT '发布时间',
  `meishimingcheng` varchar(200) DEFAULT NULL COMMENT '美食名称',
  `meishileibie` varchar(200) DEFAULT NULL COMMENT '美食类别',
  `meishijieshao` longtext COMMENT '美食介绍',
  `shangpusuozaidi` varchar(200) DEFAULT NULL COMMENT '商铺所在地',
  `tuijianzhishu` varchar(200) DEFAULT NULL COMMENT '推荐指数',
  `meishizhaopian` varchar(200) DEFAULT NULL COMMENT '美食照片',
  `shangpinjiage` varchar(200) DEFAULT NULL COMMENT '商品价格',
  `yonghuming` varchar(200) DEFAULT NULL COMMENT '用户名',
  `xingming` varchar(200) DEFAULT NULL COMMENT '姓名',
  `thumbsupnum` int DEFAULT '0' COMMENT '赞',
  `crazilynum` int DEFAULT '0' COMMENT '踩',
  `clicktime` datetime DEFAULT NULL COMMENT '最近点击时间',
  `clicknum` int DEFAULT '0' COMMENT '点击次数',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1380000000573 DEFAULT CHARSET=utf8mb3 COMMENT='美食鉴赏';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `meishijianshang`
--

LOCK TABLES `meishijianshang` WRITE;
/*!40000 ALTER TABLE `meishijianshang` DISABLE KEYS */;
INSERT INTO `meishijianshang` VALUES (22,'2026-08-23 03:17:36','2026-08-23','厚切金枪鱼刺身','日式料理','厚切鱼腩油脂丰润，配现磨山葵与手握醋饭，冷柜保鲜，当日限量供应。','南湖大学城文苑路88号B1层12号','5星','/api/upload/meishijianshang_meishizhaopian2.jpg','58.00','用户2','周砚礼',86,7,'2026-08-24 16:37:48',1267),(23,'2026-08-23 03:17:36','2026-08-23','秘制卤香猪蹄','烧卤熟食','老卤慢焖两小时，皮糯肉香不腻，撒芝麻后炭火微烤，宵夜人气单品。','南湖大学城西门美食街17号','4星','/api/upload/meishijianshang_meishizhaopian3.jpg','28.00','用户3','沈亦然',64,11,'2026-08-23 11:17:36',968),(24,'2026-08-23 03:17:36','2026-08-23','招牌肉蟹煲','特色煲类','鲜蟹配鸡爪与年糕，酱汁浓稠微辣，两人份足够，适合聚餐分享。','南湖大学城学府街206号一层','5星','/api/upload/meishijianshang_meishizhaopian4.jpg','98.00','用户4','顾青野',132,18,'2026-08-23 11:17:36',1875),(25,'2026-08-23 03:17:36','2026-08-23','彩蔬蘑菇披萨','西式轻食','手工饼底现烤，马苏里拉拉丝顺滑，黑橄榄与口蘑清爽解腻。','南湖大学城青春广场东侧A12号','4星','/api/upload/meishijianshang_meishizhaopian5.jpg','49.00','用户5','陈知遥',78,9,'2026-08-23 11:17:36',1142),(26,'2026-08-23 03:17:36','2026-08-23','泡椒牛蛙煲','湘味热炒','牛蛙嫩滑无腥味，泡椒酸辣开胃，配豆花与宽粉越煮越入味。','南湖大学城南门商业街33号','5星','/api/upload/meishijianshang_meishizhaopian6.jpg','68.00','用户6','江叙白',118,16,'2026-08-23 11:17:36',1658),(27,'2026-08-23 03:17:36','2026-08-23','蓝铃花奶油蛋糕','烘焙甜点','动物奶油轻盈不甜腻，蓝铃花造型清新，下午茶搭配红茶刚好。','南湖大学城樱花道8号一层','4星','/api/upload/picture1.jpg','45.00','用户1','林晚秋',92,8,'2026-08-24 23:28:27',1389);
/*!40000 ALTER TABLE `meishijianshang` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `storeup`
--

DROP TABLE IF EXISTS `storeup`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `storeup` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `addtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `userid` bigint NOT NULL COMMENT '用户id',
  `refid` bigint DEFAULT NULL COMMENT '收藏id',
  `tablename` varchar(200) DEFAULT NULL COMMENT '表名',
  `name` varchar(200) NOT NULL COMMENT '收藏名称',
  `picture` varchar(200) NOT NULL COMMENT '收藏图片',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1380000000633 DEFAULT CHARSET=utf8mb3 COMMENT='收藏表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `storeup`
--

LOCK TABLES `storeup` WRITE;
/*!40000 ALTER TABLE `storeup` DISABLE KEYS */;
INSERT INTO `storeup` VALUES (1380000000797,'2026-08-23 03:17:36',1380000000209,26,'meishijianshang','泡椒牛蛙煲','/api/upload/meishijianshang_meishizhaopian6.jpg'),(1380000000819,'2026-08-23 03:17:36',1380000000465,22,'meishijianshang','厚切金枪鱼刺身','/api/upload/meishijianshang_meishizhaopian2.jpg'),(1380000000632,'2026-08-23 03:17:36',11,22,'meishijianshang','厚切金枪鱼刺身','/api/upload/meishijianshang_meishizhaopian2.jpg');
/*!40000 ALTER TABLE `storeup` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `token`
--

DROP TABLE IF EXISTS `token`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `token` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `userid` bigint NOT NULL COMMENT '用户id',
  `username` varchar(100) NOT NULL COMMENT '用户名',
  `tablename` varchar(100) DEFAULT NULL COMMENT '表名',
  `role` varchar(100) DEFAULT NULL COMMENT '角色',
  `token` varchar(200) NOT NULL COMMENT '密码',
  `addtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '新增时间',
  `expiratedtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '过期时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3 COMMENT='token表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `token`
--

LOCK TABLES `token` WRITE;
/*!40000 ALTER TABLE `token` DISABLE KEYS */;
INSERT INTO `token` VALUES (1,1380000000209,'1','yonghu','用户','yct1wx4l0un5453rvdrq54x85islwcac','2026-08-23 03:17:36','2026-08-23 05:17:36'),(2,1,'abo','users','管理员','4gti0muamb6picgkkwjd0hnx3yhh5ei3','2026-08-23 03:17:36','2026-08-24 13:51:36'),(3,1380000000465,'2','yonghu','用户','mi044sb5fc8s8oi2a95ey2le80lvtb3u','2026-08-23 03:17:36','2026-08-23 05:17:36'),(4,11,'用户1','yonghu','用户','prfu6q06gokc1ukp1vtpgd6osu09wi4h','2026-08-23 03:17:36','2026-08-24 13:51:13');
/*!40000 ALTER TABLE `token` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `username` varchar(100) NOT NULL COMMENT '用户名',
  `password` varchar(100) NOT NULL COMMENT '密码',
  `role` varchar(100) DEFAULT '管理员' COMMENT '角色',
  `addtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '新增时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3 COMMENT='用户表';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2b$10$V.33Zwo5eI9OxsFZ407q1O4hoYZRuu.vV0kes04MQQstaDZqvw/Xq','管理员','2026-08-23 03:17:36');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wodehaoyou`
--

DROP TABLE IF EXISTS `wodehaoyou`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wodehaoyou` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `addtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `yonghuming` varchar(200) DEFAULT NULL COMMENT '用户名',
  `xingming` varchar(200) DEFAULT NULL COMMENT '姓名',
  `tianjiashijian` datetime DEFAULT NULL COMMENT '添加时间',
  `userid` bigint NOT NULL COMMENT '用户id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1380000000929 DEFAULT CHARSET=utf8mb3 COMMENT='我的好友';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wodehaoyou`
--

LOCK TABLES `wodehaoyou` WRITE;
/*!40000 ALTER TABLE `wodehaoyou` DISABLE KEYS */;
INSERT INTO `wodehaoyou` VALUES (1380000001074,'2026-08-23 03:17:36','用户3','沈亦然','2026-08-23 11:17:36',11),(1380000001102,'2026-08-23 03:17:36','用户4','顾青野','2026-08-23 11:17:36',11),(1380000001103,'2026-08-23 03:17:36','用户5','陈知遥','2026-08-23 11:17:36',11);
/*!40000 ALTER TABLE `wodehaoyou` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `yonghu`
--

DROP TABLE IF EXISTS `yonghu`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `yonghu` (
  `id` bigint NOT NULL AUTO_INCREMENT COMMENT '主键',
  `addtime` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `yonghuming` varchar(200) NOT NULL COMMENT '用户名',
  `mima` varchar(200) NOT NULL COMMENT '密码',
  `xingming` varchar(200) NOT NULL COMMENT '姓名',
  `shouji` varchar(200) DEFAULT NULL COMMENT '手机',
  `youxiang` varchar(200) DEFAULT NULL COMMENT '邮箱',
  `shenfenzheng` varchar(200) NOT NULL COMMENT '身份证',
  `zhaopian` varchar(200) DEFAULT NULL COMMENT '照片',
  PRIMARY KEY (`id`),
  UNIQUE KEY `yonghuming` (`yonghuming`)
) ENGINE=InnoDB AUTO_INCREMENT=1380000000466 DEFAULT CHARSET=utf8mb3 COMMENT='用户';
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `yonghu`
--

LOCK TABLES `yonghu` WRITE;
/*!40000 ALTER TABLE `yonghu` DISABLE KEYS */;
INSERT INTO `yonghu` VALUES (11,'2026-08-23 03:17:36','用户1','$2b$10$V.33Zwo5eI9OxsFZ407q1O4hoYZRuu.vV0kes04MQQstaDZqvw/Xq','林晚秋','13800000012','user7@example.com','110105200001010001X','/api/upload/yonghu_zhaopian1.jpg'),(13,'2026-08-23 03:17:36','用户3','$2b$10$V.33Zwo5eI9OxsFZ407q1O4hoYZRuu.vV0kes04MQQstaDZqvw/Xq','沈亦然','13800000013','user8@example.com','110105200001010002X','/api/upload/yonghu_zhaopian3.jpg'),(14,'2026-08-23 03:17:36','用户4','$2b$10$V.33Zwo5eI9OxsFZ407q1O4hoYZRuu.vV0kes04MQQstaDZqvw/Xq','顾青野','13800000014','user9@example.com','110105200001010003X','/api/upload/yonghu_zhaopian4.jpg'),(15,'2026-08-23 03:17:36','用户5','$2b$10$V.33Zwo5eI9OxsFZ407q1O4hoYZRuu.vV0kes04MQQstaDZqvw/Xq','陈知遥','13800000015','user10@example.com','110105200001010004X','/api/upload/yonghu_zhaopian5.jpg'),(16,'2026-08-23 03:17:36','用户6','$2b$10$V.33Zwo5eI9OxsFZ407q1O4hoYZRuu.vV0kes04MQQstaDZqvw/Xq','江叙白','13800000016','user11@example.com','110105200001010005X','/api/upload/yonghu_zhaopian6.jpg'),(1380000000209,'2026-08-23 03:17:36','1','$2b$10$STSphBWz90y8qELh3dRfZOyKWwuGM8wU8zfuZDJrO43EFL8oZmjf2','李清让','13800000017','user12@example.com','110105200001010006X','/api/upload/1380000001802.jpg'),(1380000000465,'2026-08-23 03:17:36','2','$2b$10$V.33Zwo5eI9OxsFZ407q1O4hoYZRuu.vV0kes04MQQstaDZqvw/Xq','周砚礼','13800000019','user13@example.com','110105200001010007X','/api/upload/1380000002077.jpg');
/*!40000 ALTER TABLE `yonghu` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-24 23:54:32
