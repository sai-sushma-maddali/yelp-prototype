-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: yelp_db
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `favorites`
--

DROP TABLE IF EXISTS `favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `favorites` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `created_at` datetime DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `restaurant_id` (`restaurant_id`),
  KEY `ix_favorites_id` (`id`),
  CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites`
--

LOCK TABLES `favorites` WRITE;
/*!40000 ALTER TABLE `favorites` DISABLE KEYS */;
INSERT INTO `favorites` VALUES (3,3,1,'2026-03-22 10:35:04');
/*!40000 ALTER TABLE `favorites` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_claims`
--

DROP TABLE IF EXISTS `restaurant_claims`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_claims` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT NULL,
  `created_at` datetime DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `restaurant_id` (`restaurant_id`),
  KEY `ix_restaurant_claims_id` (`id`),
  CONSTRAINT `restaurant_claims_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `restaurant_claims_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_claims`
--

LOCK TABLES `restaurant_claims` WRITE;
/*!40000 ALTER TABLE `restaurant_claims` DISABLE KEYS */;
INSERT INTO `restaurant_claims` VALUES (1,2,1,'approved','2026-02-28 11:51:30'),(2,2,4,'approved','2026-03-22 11:30:00'),(3,15,10,'approved','2026-03-22 12:05:24');
/*!40000 ALTER TABLE `restaurant_claims` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurant_photos`
--

DROP TABLE IF EXISTS `restaurant_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurant_photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `restaurant_id` int NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `restaurant_id` (`restaurant_id`),
  KEY `ix_restaurant_photos_id` (`id`),
  CONSTRAINT `restaurant_photos_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurant_photos`
--

LOCK TABLES `restaurant_photos` WRITE;
/*!40000 ALTER TABLE `restaurant_photos` DISABLE KEYS */;
INSERT INTO `restaurant_photos` VALUES (1,3,'/uploads/restaurant_photos/3/2eca1f62-da5a-4efc-95f4-6221c73efa57.jpg','2026-03-22 12:21:47'),(2,3,'/uploads/restaurant_photos/3/fff18f0b-167d-4c71-8a9d-1f35de5024d7.jpg','2026-03-22 12:22:58'),(3,3,'/uploads/restaurant_photos/3/25910356-61c3-42e2-9dee-7f00c1435b70.jpg','2026-03-22 12:24:08'),(4,3,'/uploads/restaurant_photos/3/1250da81-b4c7-4463-9d3c-4ca1c8ff772d.jpg','2026-03-22 12:24:08'),(5,2,'/uploads/restaurant_photos/2/956ec633-a8bd-4fe6-9a2f-9f3ab58be680.jpg','2026-03-22 12:27:16'),(6,2,'/uploads/restaurant_photos/2/964e8f40-20af-4476-826b-6b27140d68a8.jpg','2026-03-22 12:27:16'),(7,2,'/uploads/restaurant_photos/2/2b7ad974-5eec-4876-ae6a-5a6fad5efdd6.jpg','2026-03-22 12:27:16'),(8,9,'/uploads/restaurant_photos/9/4dfd0d51-188f-43f6-82d3-089735d269b2.png','2026-03-22 12:30:07'),(9,9,'/uploads/restaurant_photos/9/63b37d05-6ae2-49f4-9ac6-2d7b7e7d82d9.jpg','2026-03-22 12:30:19'),(10,9,'/uploads/restaurant_photos/9/3ffa702c-3c5b-49ca-b757-3a064edc41f1.webp','2026-03-22 12:30:19'),(11,1,'/uploads/restaurant_photos/1/21ab6102-0279-4418-a878-10ac4a7dde10.jpg','2026-03-22 12:32:53'),(12,4,'/uploads/restaurant_photos/4/51f2f8c1-7302-4b7e-a950-12f5dfa17694.jpg','2026-03-22 12:33:22'),(13,6,'/uploads/restaurant_photos/6/6dee4b41-040e-4d75-9ca8-d9fc0e8a01d7.jpg','2026-03-22 12:34:20'),(14,7,'/uploads/restaurant_photos/7/13ca7ae2-729e-4588-a120-93e7a806dc5c.jpg','2026-03-22 12:35:30'),(15,8,'/uploads/restaurant_photos/8/7c798846-0446-445f-be54-250aefd85223.jpg','2026-03-22 12:36:23'),(16,5,'/uploads/restaurant_photos/5/18488d32-2a16-42cd-9a1c-0f383b6a3d7c.jpg','2026-03-22 12:39:24'),(17,10,'/uploads/restaurant_photos/10/e6153e56-9aed-460a-85a2-8f97ec725206.webp','2026-03-22 12:41:19');
/*!40000 ALTER TABLE `restaurant_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `restaurants`
--

DROP TABLE IF EXISTS `restaurants`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `restaurants` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `cuisine_type` varchar(100) DEFAULT NULL,
  `description` text,
  `address` varchar(300) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `zip_code` varchar(20) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `website` varchar(200) DEFAULT NULL,
  `hours` varchar(500) DEFAULT NULL,
  `price_tier` enum('$','$$','$$$','$$$$') DEFAULT NULL,
  `amenities` varchar(300) DEFAULT NULL,
  `avg_rating` float DEFAULT NULL,
  `review_count` int DEFAULT NULL,
  `is_claimed` tinyint(1) DEFAULT NULL,
  `owner_id` int DEFAULT NULL,
  `created_at` datetime DEFAULT (now()),
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  KEY `ix_restaurants_name` (`name`),
  KEY `ix_restaurants_id` (`id`),
  KEY `ix_restaurants_city` (`city`),
  CONSTRAINT `restaurants_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `restaurants`
--

LOCK TABLES `restaurants` WRITE;
/*!40000 ALTER TABLE `restaurants` DISABLE KEYS */;
INSERT INTO `restaurants` VALUES (1,'Pasta Paradise','Italian','Owner updated: Best Italian in the Bay Area!','123 Main St','San Jose','CA','95101','408-555-0001',NULL,NULL,'{\"mon\": \"11am-10pm\", \"tue\": \"11am-10pm\"}','$$','wifi,outdoor_seating,parking',4.45,11,1,2,'2026-02-28 11:35:12','2026-03-22 10:34:55'),(2,'Green Leaf Cafe','American','100% plant-based menu with locally sourced ingredients. A cozy spot for vegans and health-conscious diners.','456 Oak Avenue','San Jose','CA','95112','408-555-0002','hello@greenleaf.com',NULL,'{\"mon\":\"8am-8pm\",\"tue\":\"8am-8pm\",\"wed\":\"8am-8pm\",\"thu\":\"8am-8pm\",\"fri\":\"8am-9pm\",\"sat\":\"9am-9pm\",\"sun\":\"9am-7pm\"}','$','wifi,outdoor_seating,vegan_friendly,wheelchair_accessible',4.2,10,0,3,'2026-03-22 10:59:43',NULL),(3,'Candlelight Bistro','French','Romantic fine dining with classic French cuisine, an extensive wine list, and intimate candlelit ambiance. Perfect for special occasions.','789 Elm Boulevard','San Jose','CA','95125','4085550003','reservations@candlelightbistro.com','https://candlelightbistro.com','{\"tue\":\"5pm-11pm\",\"wed\":\"5pm-11pm\",\"thu\":\"5pm-11pm\",\"fri\":\"5pm-12am\",\"sat\":\"4pm-12am\",\"sun\":\"4pm-10pm\"}','$$$','romantic,bar,reservations,parking,wheelchair_accessible',4.44,9,0,3,'2026-03-22 11:01:47',NULL),(4,'Sakura Sushi','Japanese','Fresh sushi and traditional Japanese dishes. Our chefs trained in Tokyo bring authentic flavors to every plate.','321 Cherry Lane','San Jose','CA','95110','408-555-0004','sakura@sakurasushi.com',NULL,'{\"mon\":\"11:30am-2:30pm\",\"tue\":\"11:30am-2:30pm\",\"wed\":\"11:30am-2:30pm\",\"thu\":\"11:30am-10pm\",\"fri\":\"11:30am-11pm\",\"sat\":\"12pm-11pm\",\"sun\":\"12pm-9pm\"}','$$','reservations,takeout,delivery,bar',4.4,10,1,2,'2026-03-22 11:06:48','2026-03-22 11:30:00'),(5,'Spice Garden','Indian','Vibrant Indian cuisine featuring rich curries, tandoor specialties, and fresh naan. Vegetarian and vegan options available.','654 Curry Court','San Jose','CA','95128','408-555-0005',NULL,NULL,'{\"mon\":\"11am-10pm\",\"tue\":\"11am-10pm\",\"wed\":\"11am-10pm\",\"thu\":\"11am-10pm\",\"fri\":\"11am-11pm\",\"sat\":\"11am-11pm\",\"sun\":\"12pm-10pm\"}','$$','vegan_friendly,halal,delivery,takeout,family_friendly',4.33,9,0,1,'2026-03-22 11:06:48',NULL),(6,'The Burger Lab','American','Gourmet craft burgers with locally sourced beef, creative toppings, and hand-cut fries. Casual and fun atmosphere.','987 Grill Street','San Jose','CA','95116','408-555-0006','','','{\"mon\":\"10am-10pm\",\"tue\":\"10am-10pm\",\"wed\":\"10am-10pm\",\"thu\":\"10am-10pm\",\"fri\":\"10am-11pm\",\"sat\":\"10am-11pm\",\"sun\":\"11am-9pm\"}','$','wifi,outdoor_seating,family_friendly,takeout,delivery,casual',4.2,10,0,2,'2026-03-22 11:06:48','2026-03-22 11:29:34'),(7,'Dragon Palace','Chinese','Traditional Cantonese dim sum and authentic Chinese dishes. Famous for weekend brunch dim sum service.','246 Lotus Lane','San Jose','CA','95122','408-555-0007',NULL,NULL,'{\"mon\":\"10am-9pm\",\"tue\":\"10am-9pm\",\"wed\":\"10am-9pm\",\"thu\":\"10am-9pm\",\"fri\":\"10am-10pm\",\"sat\":\"9am-10pm\",\"sun\":\"9am-9pm\"}','$$','family_friendly,parking,reservations,takeout',4.33,9,0,2,'2026-03-22 11:06:48',NULL),(8,'Taco Fiesta','Mexican','Authentic street-style tacos, burritos and margaritas. Lively atmosphere with live music on weekends.','135 Salsa Street','San Jose','CA','95126','408-555-0008',NULL,NULL,'{\"mon\":\"10am-10pm\",\"tue\":\"10am-10pm\",\"wed\":\"10am-10pm\",\"thu\":\"10am-11pm\",\"fri\":\"10am-12am\",\"sat\":\"9am-12am\",\"sun\":\"9am-10pm\"}','$','outdoor_seating,bar,live_music,family_friendly,takeout',4.2,10,0,2,'2026-03-22 11:06:48',NULL),(9,'Seoul Kitchen','Korean','Korean BBQ and traditional dishes in a modern setting. Table-side grilling experience with premium cuts of meat.','579 K-Street','San Jose','CA','95132','408-555-0009',NULL,NULL,'{\"mon\":\"12pm-10pm\",\"tue\":\"12pm-10pm\",\"wed\":\"12pm-10pm\",\"thu\":\"12pm-11pm\",\"fri\":\"12pm-12am\",\"sat\":\"11am-12am\",\"sun\":\"11am-10pm\"}','$$$','bar,reservations,parking,family_friendly,live_music',4.4,10,0,3,'2026-03-22 11:06:48','2026-03-22 12:11:53'),(10,'The Mediterranean Table','Mediterranean','Fresh and healthy Mediterranean cuisine featuring hummus, falafel, shawarma and grilled seafood. Relaxed and welcoming atmosphere.','802 Olive Grove','San Jose','CA','95136','408-555-0010',NULL,NULL,'{\"mon\":\"11am-9pm\",\"tue\":\"11am-9pm\",\"wed\":\"11am-9pm\",\"thu\":\"11am-9pm\",\"fri\":\"11am-10pm\",\"sat\":\"10am-10pm\",\"sun\":\"10am-9pm\"}','$$','halal,vegan_friendly,outdoor_seating,wifi,family_friendly,wheelchair_accessible',4.4,10,1,15,'2026-03-22 11:06:48','2026-03-22 12:05:24');
/*!40000 ALTER TABLE `restaurants` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `review_photos`
--

DROP TABLE IF EXISTS `review_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `review_photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `review_id` int NOT NULL,
  `photo_url` varchar(255) NOT NULL,
  `created_at` datetime DEFAULT (now()),
  PRIMARY KEY (`id`),
  KEY `review_id` (`review_id`),
  KEY `ix_review_photos_id` (`id`),
  CONSTRAINT `review_photos_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `review_photos`
--

LOCK TABLES `review_photos` WRITE;
/*!40000 ALTER TABLE `review_photos` DISABLE KEYS */;
/*!40000 ALTER TABLE `review_photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews`
--

DROP TABLE IF EXISTS `reviews`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `restaurant_id` int NOT NULL,
  `rating` int NOT NULL,
  `comment` text,
  `created_at` datetime DEFAULT (now()),
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `restaurant_id` (`restaurant_id`),
  KEY `ix_reviews_id` (`id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews`
--

LOCK TABLES `reviews` WRITE;
/*!40000 ALTER TABLE `reviews` DISABLE KEYS */;
INSERT INTO `reviews` VALUES (2,1,1,5,'Amazing pasta! Best Italian food in San Jose.','2026-02-28 11:43:36',NULL),(4,4,1,5,'Absolutely incredible pasta! The carbonara was the best I have ever had outside of Rome. Will definitely be back.','2026-03-20 11:13:25',NULL),(5,5,1,4,'Great food and cozy atmosphere. The wood-fired pizza was delicious. Service was a bit slow on Friday night.','2026-03-17 11:13:25',NULL),(6,6,1,5,'Best Italian in San Jose hands down. The tiramisu was to die for. Highly recommend making a reservation.','2026-03-14 11:13:25',NULL),(7,7,1,3,'Food was good but portions felt a little small for the price. The bread basket was amazing though.','2026-03-10 11:13:25',NULL),(8,8,1,5,'Celebrated my anniversary here. The staff went above and beyond to make it special. Food was phenomenal.','2026-03-06 11:13:25',NULL),(9,9,1,4,'Lovely ambiance and great pasta. The outdoor seating area is beautiful in the evening. Parking can be tricky.','2026-03-02 11:13:25',NULL),(10,10,1,5,'The gnocchi was pillowy soft and the sauce was rich and flavourful. One of my favourite restaurants in the city.','2026-02-25 11:13:25',NULL),(11,11,1,4,'Wonderful experience from start to finish. The bruschetta starter was fresh and the lasagne was hearty and delicious.','2026-02-20 11:13:25',NULL),(12,12,1,5,'The sommelier recommended a perfect Chianti to pair with our meal. Authentic Italian experience in San Jose.','2026-02-15 11:13:25',NULL),(13,13,1,4,'Great spot for a date night. Warm lighting, attentive staff and genuinely delicious food. Highly recommend.','2026-02-10 11:13:25',NULL),(14,4,2,5,'As a vegan this place is a dream. Everything on the menu is plant-based and absolutely delicious.','2026-03-19 11:13:25',NULL),(15,5,2,4,'Really impressive vegan food. Even my meat-eating friends loved it. The smoothie bowls are amazing.','2026-03-16 11:13:25',NULL),(16,6,2,5,'Fresh healthy food at a great price. Love the relaxed atmosphere and friendly staff. My go-to lunch spot.','2026-03-13 11:13:25',NULL),(17,7,2,4,'Great options for vegans and non-vegans alike. The Buddha bowl was filling and tasty. Will be back for sure.','2026-03-09 11:13:25',NULL),(18,8,2,3,'Food is good but service was slow during lunch rush. The portions could be bigger for the price.','2026-03-05 11:13:25',NULL),(19,9,2,5,'The best plant-based burger I have ever tried. Outdoor seating is lovely on a sunny day.','2026-03-01 11:13:25',NULL),(20,10,2,4,'Love this place. Wholesome food that makes you feel good. The green detox smoothie is a must try.','2026-02-24 11:13:25',NULL),(21,11,2,5,'Finally a cafe that takes vegan food seriously. Everything is fresh and full of flavour. Highly recommend.','2026-02-19 11:13:25',NULL),(22,12,2,4,'Great for a healthy quick lunch. The grain bowls are filling and nutritious. Staff are always friendly.','2026-02-14 11:13:25',NULL),(23,13,2,3,'Decent vegan food but menu could use more variety. The smoothies are excellent though.','2026-02-09 11:13:25',NULL),(24,4,3,5,'Absolutely stunning dining experience. The duck confit was perfectly prepared and the wine pairing was exceptional.','2026-03-20 11:13:25',NULL),(25,5,3,5,'Took my partner here for our anniversary. The ambiance is incredibly romantic. Every dish was a masterpiece.','2026-03-15 11:13:25',NULL),(26,6,3,4,'Exceptional French cuisine. The escargot and beef bourguignon were outstanding. Pricey but worth every penny.','2026-03-11 11:13:25',NULL),(27,7,3,5,'The best restaurant in San Jose for a special occasion. Service is impeccable and food is extraordinary.','2026-03-08 11:13:25',NULL),(28,8,3,3,'Food is great but extremely expensive. Felt a bit rushed by the waiter on a busy Saturday night.','2026-03-03 11:13:25',NULL),(29,9,3,5,'The creme brulee was the best dessert I have ever had. Perfect for a romantic night out.','2026-02-27 11:13:25',NULL),(30,10,3,4,'Wonderful atmosphere and delicious food. The sommelier was very knowledgeable and helpful with wine selection.','2026-02-22 11:13:25',NULL),(31,11,3,5,'Impeccable service and extraordinary flavours. The French onion soup was rich and deeply satisfying.','2026-02-17 11:13:25',NULL),(32,12,3,4,'Lovely fine dining experience. The tasting menu is well worth the price. Beautiful presentation on every plate.','2026-02-12 11:13:25',NULL),(33,4,4,5,'The freshest sushi I have had outside of Japan. The omakase set was incredible value and beautifully presented.','2026-03-21 11:13:25',NULL),(34,5,4,4,'Excellent sushi and very attentive service. The salmon sashimi melted in my mouth. Great date night spot.','2026-03-18 11:13:25',NULL),(35,6,4,5,'Authentic Japanese flavours done perfectly. The miso soup and edamame were great starters. Will be back weekly.','2026-03-15 11:13:25',NULL),(36,7,4,4,'Really solid sushi place. The rolls are creative and delicious. Love the minimalist decor and calm atmosphere.','2026-03-12 11:13:25',NULL),(37,8,4,3,'Good sushi but the wait time was long even with a reservation. Food made up for it though.','2026-03-07 11:13:25',NULL),(38,9,4,5,'The chef special rolls were amazing. Dragon roll and spicy tuna were highlights. Highly recommend.','2026-03-03 11:13:25',NULL),(39,10,4,4,'Fresh ingredients and beautiful presentation. The sake selection is impressive. Perfect for a special night out.','2026-02-26 11:13:25',NULL),(40,11,4,5,'Best sushi in San Jose without a doubt. The fish is always fresh and the service is outstanding.','2026-02-21 11:13:25',NULL),(41,12,4,4,'The tuna tartare was exceptional. Clean modern decor and very knowledgeable staff. Will definitely return.','2026-02-16 11:13:25',NULL),(42,13,4,5,'Genuine Japanese hospitality combined with extraordinary sushi. The wagyu nigiri was absolutely divine.','2026-02-11 11:13:25',NULL),(43,4,5,4,'Incredible Indian food with authentic spices. The butter chicken was rich and creamy. Naan was perfectly baked.','2026-03-20 11:13:25',NULL),(44,5,5,5,'The best Indian restaurant in the Bay Area. The lamb biryani was fragrant and flavourful. Highly recommend.','2026-03-17 11:13:25',NULL),(45,6,5,4,'Great variety of vegetarian options. The paneer tikka masala and dal makhani were both excellent.','2026-03-14 11:13:25',NULL),(46,7,5,5,'Spice levels are perfect and the food is so authentic. Reminds me of home cooked Indian food. Fantastic.','2026-03-10 11:13:25',NULL),(47,8,5,3,'Food was good but a bit too oily for my taste. The service was friendly and the portions were generous.','2026-03-06 11:13:25',NULL),(48,9,5,4,'Loved the halal options and the warm hospitality. The chicken tikka was tender and perfectly spiced.','2026-03-02 11:13:25',NULL),(49,10,5,5,'The samosas and chaat are the best starters. Perfect for a family dinner. Kids loved the mild curry options.','2026-02-25 11:13:25',NULL),(50,11,5,4,'Generous portions and very reasonable prices. The garlic naan and saag paneer combo is unbeatable.','2026-02-20 11:13:25',NULL),(51,12,5,5,'Truly authentic Indian cooking. The aromatic spices fill the room. The mango lassi is thick and refreshing.','2026-02-15 11:13:25',NULL),(52,4,6,5,'Best burger I have ever eaten. The truffle mushroom burger was out of this world. Crispy fries were perfect.','2026-03-21 11:13:25',NULL),(53,5,6,4,'Really creative burger combinations. The smash burger with caramelised onions was incredible. Great value.','2026-03-18 11:13:25',NULL),(54,6,6,5,'Casual fun place with amazing burgers. The milkshakes are thick and delicious. Perfect for a casual night out.','2026-03-15 11:13:25',NULL),(55,7,6,4,'Great quality ingredients and generous portions. The bacon cheeseburger is a classic done perfectly.','2026-03-12 11:13:25',NULL),(56,8,6,3,'Good burgers but gets really crowded on weekends. Service slows down when busy. Food is worth the wait.','2026-03-08 11:13:25',NULL),(57,9,6,5,'The veggie burger is surprisingly amazing. Crispy on the outside and juicy on the inside. Love this place.','2026-03-04 11:13:25',NULL),(58,10,6,4,'Fun atmosphere and delicious food. Great spot for a casual lunch. The onion rings are addictive.','2026-02-27 11:13:25',NULL),(59,11,6,5,'Finally a burger place that uses quality ingredients. The grass-fed beef patty flavour is incredible.','2026-02-22 11:13:25',NULL),(60,12,6,4,'The double smash burger was a revelation. Perfectly seasoned and juicy. Great craft beer selection too.','2026-02-17 11:13:25',NULL),(61,13,6,3,'Decent burgers but nothing super unique. Good for a quick meal. The sweet potato fries were a highlight.','2026-02-12 11:13:25',NULL),(62,4,7,4,'Excellent dim sum on the weekend. The har gow and siu mai were perfectly steamed. A real family favourite.','2026-03-20 11:13:25',NULL),(63,5,7,5,'Authentic Cantonese cooking at its finest. The roast duck and BBQ pork were exceptional. Highly recommend.','2026-03-17 11:13:25',NULL),(64,6,7,4,'Great family restaurant with a wide variety of dishes. The fried rice and noodles are consistently good.','2026-03-14 11:13:25',NULL),(65,7,7,5,'The weekend dim sum brunch is a must. So many delicious options brought to your table. Great value.','2026-03-10 11:13:25',NULL),(66,8,7,3,'Food is good but the restaurant gets very noisy and crowded. Better to go on weekdays for a quieter meal.','2026-03-05 11:13:25',NULL),(67,9,7,4,'Loved the hot and sour soup and the Peking duck. Generous portions and reasonable prices. Will return.','2026-02-28 11:13:25',NULL),(68,10,7,5,'The best Chinese food in San Jose. Everything we ordered was delicious. Staff are friendly and attentive.','2026-02-23 11:13:25',NULL),(69,11,7,4,'The char siu bao and turnip cake were highlights of the dim sum. Great tea selection as well.','2026-02-18 11:13:25',NULL),(70,12,7,5,'Incredible flavours and huge portions. The seafood dishes are always fresh. A go-to for family gatherings.','2026-02-13 11:13:25',NULL),(71,4,8,5,'Best tacos in San Jose! The al pastor and carnitas tacos are phenomenal. The margaritas are strong and delicious.','2026-03-21 11:13:25',NULL),(72,5,8,4,'Great authentic Mexican food. The burritos are huge and packed with flavour. Live music on Saturday was amazing.','2026-03-18 11:13:25',NULL),(73,6,8,5,'Love this place for a fun night out. The guacamole is made fresh at the table. Incredible atmosphere.','2026-03-15 11:13:25',NULL),(74,7,8,4,'Really good street-style tacos at great prices. The salsa bar has amazing variety. Perfect casual dining.','2026-03-11 11:13:25',NULL),(75,8,8,3,'Food is good but service was slow during weekend rush. The outdoor seating gets cold at night.','2026-03-06 11:13:25',NULL),(76,9,8,5,'The fish tacos were absolutely incredible. Fresh ingredients and generous portions. One of my favourites.','2026-03-01 11:13:25',NULL),(77,10,8,4,'Great value for money. The enchiladas and rice were delicious. Fun lively atmosphere with great music.','2026-02-24 11:13:25',NULL),(78,11,8,5,'Authentic flavours that remind me of Mexico City. The horchata was refreshing and the tacos were perfect.','2026-02-19 11:13:25',NULL),(79,12,8,4,'The chicken quesadillas and churros were both fantastic. Great spot for a group dinner.','2026-02-14 11:13:25',NULL),(80,13,8,3,'Tacos were good but nothing extraordinary. The margaritas were the highlight. Nice outdoor seating area.','2026-02-09 11:13:25',NULL),(81,4,9,5,'The Korean BBQ experience here is unmatched. Premium quality meat and the banchan sides were all delicious.','2026-03-20 11:13:25',NULL),(82,5,9,4,'Great Korean BBQ with high quality cuts. The galbi and bulgogi were both excellent. Fun interactive dining.','2026-03-17 11:13:25',NULL),(83,6,9,5,'Absolutely loved the table-side grilling experience. The kimchi was house-made and incredibly flavourful.','2026-03-14 11:13:25',NULL),(84,7,9,4,'One of the best Korean restaurants in the Bay Area. The seafood pancake was crispy and delicious.','2026-03-10 11:13:25',NULL),(85,8,9,3,'Food is great but very expensive for the portion sizes. The atmosphere makes up for it though.','2026-03-05 11:13:25',NULL),(86,9,9,5,'The bibimbap and doenjang jjigae were authentic and delicious. Staff were helpful in explaining the menu.','2026-02-28 11:13:25',NULL),(87,10,9,4,'Fantastic Korean BBQ. The ventilation works well so you do not leave smelling of smoke. Great experience.','2026-02-23 11:13:25',NULL),(88,11,9,5,'Incredible dining experience. The meat quality is exceptional and the service is attentive and friendly.','2026-02-18 11:13:25',NULL),(89,12,9,4,'The spicy rice cakes and japchae noodles were outstanding starters before the BBQ. Highly recommend.','2026-02-13 11:13:25',NULL),(90,13,9,5,'Best Korean BBQ in the South Bay without question. The wagyu beef option is worth every extra dollar.','2026-02-08 11:13:25',NULL),(91,4,10,5,'The freshest Mediterranean food I have had. The hummus and falafel were absolutely authentic and delicious.','2026-03-20 11:13:25',NULL),(92,5,10,4,'Great healthy food with generous portions. The shawarma wrap was packed with flavour. Love the outdoor seating.','2026-03-17 11:13:25',NULL),(93,6,10,5,'Wonderful Mediterranean cuisine. The grilled fish was perfectly seasoned and the mezze platter was incredible.','2026-03-14 11:13:25',NULL),(94,7,10,4,'Really enjoyed the variety of options. Great for vegetarians and meat-eaters alike. The staff are very welcoming.','2026-03-10 11:13:25',NULL),(95,8,10,5,'The lamb kebabs were tender and perfectly spiced. The baklava dessert was a perfect finish. Will be back.','2026-03-05 11:13:25',NULL),(96,9,10,3,'Food was good but service was a bit slow. The pita bread was warm and fresh which was a nice touch.','2026-02-28 11:13:25',NULL),(97,10,10,4,'Love the healthy vibe of this place. The grain bowls and salads are fresh and filling. Great lunch spot.','2026-02-23 11:13:25',NULL),(98,11,10,5,'Authentic Mediterranean flavours done beautifully. The stuffed grape leaves were the best I have ever had.','2026-02-18 11:13:25',NULL),(99,12,10,4,'The chicken shawarma plate was generous and delicious. The garlic sauce was addictive. Great value.','2026-02-13 11:13:25',NULL),(100,13,10,5,'A hidden gem in San Jose. The whole grilled sea bass was exceptional. Relaxed and welcoming atmosphere.','2026-02-08 11:13:25',NULL);
/*!40000 ALTER TABLE `reviews` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_preferences`
--

DROP TABLE IF EXISTS `user_preferences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_preferences` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `cuisine_preferences` varchar(500) DEFAULT NULL,
  `price_range` enum('$','$$','$$$','$$$$') DEFAULT NULL,
  `preferred_location` varchar(200) DEFAULT NULL,
  `search_radius_km` int DEFAULT NULL,
  `dietary_needs` varchar(300) DEFAULT NULL,
  `ambiance` varchar(300) DEFAULT NULL,
  `sort_preference` enum('rating','distance','popularity','price') DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`),
  KEY `ix_user_preferences_id` (`id`),
  CONSTRAINT `user_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_preferences`
--

LOCK TABLES `user_preferences` WRITE;
/*!40000 ALTER TABLE `user_preferences` DISABLE KEYS */;
INSERT INTO `user_preferences` VALUES (1,1,'Italian,Mexican,Japanese','$$','San Jose, CA',15,'vegetarian','casual,romantic','rating'),(2,3,'Mediterranean, Italian, Indian','$$','San Jose',10,'vegan','casual','rating');
/*!40000 ALTER TABLE `user_preferences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `about_me` varchar(500) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `country` varchar(100) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `languages` varchar(200) DEFAULT NULL,
  `gender` enum('male','female','other','prefer_not_to_say') DEFAULT NULL,
  `profile_pic` varchar(255) DEFAULT NULL,
  `role` enum('user','owner') NOT NULL,
  `is_active` tinyint(1) DEFAULT NULL,
  `created_at` datetime DEFAULT (now()),
  `updated_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ix_users_email` (`email`),
  KEY `ix_users_id` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'John Doe','john@example.com','$2b$12$P7u9S4H875sPmAZ1MV3BAOE4X7nMMz8cOrQPv.vrhMqn58u5EyaZW','408-555-1234','I love trying new restaurants!','San Jose','United States','CA',NULL,'male','/uploads/profile_pics\\a0d2de1a-30f1-4bf7-8375-62f75702d77b.jpg','user',1,'2026-02-28 11:06:22','2026-02-28 11:27:53'),(2,'Restaurant Owner','owner@example.com','$2b$12$TsSxBqFGsdlf/.dCBofgk.1tStE5XQDrJ1o6wCKqV8mQT6Z41FBkO',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'owner',1,'2026-02-28 11:50:15',NULL),(3,'Amelia Taylor','amelia.taylor@gmail.com','$2b$12$H46lbZWAzH0Rs2VpHrk7lOTYQRBlZsjPnojbjz67Bte5DAo.VHavS',NULL,NULL,NULL,'United States',NULL,NULL,'female','/uploads/profile_pics/22884f43-0ef7-4c0b-a65b-9d0ebb045c68.avif','user',1,'2026-03-22 10:26:41','2026-03-22 10:49:52'),(4,'James Mitchell','james.mitchell@gmail.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBAt4OXbp8GF6i',NULL,NULL,'San Jose','United States','CA','English','male',NULL,'user',1,'2025-12-22 11:11:28',NULL),(5,'Priya Sharma','priya.sharma@gmail.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBAt4OXbp8GF6i',NULL,NULL,'Santa Clara','United States','CA','English, Hindi','female',NULL,'user',1,'2025-12-27 11:11:28',NULL),(6,'Carlos Rivera','carlos.rivera@gmail.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBAt4OXbp8GF6i',NULL,NULL,'San Jose','United States','CA','English, Spanish','male',NULL,'user',1,'2026-01-01 11:11:28',NULL),(7,'Emily Chen','emily.chen@gmail.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBAt4OXbp8GF6i',NULL,NULL,'Sunnyvale','United States','CA','English, Chinese','female',NULL,'user',1,'2026-01-06 11:11:28',NULL),(8,'Aiden O Brien','aiden.obrien@gmail.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBAt4OXbp8GF6i',NULL,NULL,'Mountain View','United States','CA','English','male',NULL,'user',1,'2026-01-11 11:11:28',NULL),(9,'Fatima Al Hassan','fatima.alhassan@gmail.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBAt4OXbp8GF6i',NULL,NULL,'San Jose','United States','CA','English, Arabic','female',NULL,'user',1,'2026-01-16 11:11:28',NULL),(10,'Noah Williams','noah.williams@gmail.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBAt4OXbp8GF6i',NULL,NULL,'Cupertino','United States','CA','English','male',NULL,'user',1,'2026-01-21 11:11:28',NULL),(11,'Yuki Tanaka','yuki.tanaka@gmail.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBAt4OXbp8GF6i',NULL,NULL,'San Jose','United States','CA','English, Japanese','female',NULL,'user',1,'2026-01-26 11:11:28',NULL),(12,'Marcus Johnson','marcus.johnson@gmail.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBAt4OXbp8GF6i',NULL,NULL,'Fremont','United States','CA','English','male',NULL,'user',1,'2026-01-31 11:11:28',NULL),(13,'Sofia Rossi','sofia.rossi@gmail.com','$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/lewdBAt4OXbp8GF6i',NULL,NULL,'San Jose','United States','CA','English, Italian','female',NULL,'user',1,'2026-02-05 11:11:28',NULL),(14,'Stella Baker','stella.baker@gmail.com','$2b$12$1PcKobiUCtxt454bc/BY7Oy1wX.hpD5IkjFTutIg7H3Filqcs4S9K',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'user',1,'2026-03-22 12:03:22',NULL),(15,'Jay Kapoor','jay.kapoor12@gmail.com','$2b$12$Sffdll7Js7NEkCb6E5gP/uqp7BELg3qnfbjR70PEzcBoAQ0ZJE5IG',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'owner',1,'2026-03-22 12:05:08',NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-22 13:00:27
