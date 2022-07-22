const express = require("express");
// const { checkSchema } = require('express-validator');

//Middleware
const isAuthenticated = require("./../../../app/middleware/CheckAuth");
// const validatorRequestHandler = require('./../../app/middleware/ValidatorRequestHandler');

// Schema
// const FoodItemSearchSchema = require('./../../app/Schema/FoodItemSearchSchema');

// Controller
const mealPlanController = require("./../../../app/controllers/api/MealPlan/meal_plan");

const router = express.Router();

router.post(
  "/user_meal_plan",
  isAuthenticated,
  mealPlanController.meal_plan_list_by_user_id
);
// router.post('/custom_user_meal_plan', isAuthenticated, mealPlanController.custom_meal_plan_list_by_user_id)
router.post(
  "/meal-added-dairy",
  isAuthenticated,
  mealPlanController.updateDairy
);
router.post(
  "/create-custom-meal-plan",
  isAuthenticated,
  mealPlanController.createCustomMeal
);
router.get(
  "/get-specific-meal",
  isAuthenticated,
  mealPlanController.getSpecificDateMeal
);
router.post(
  "/add-more-ingredient",
  isAuthenticated,
  mealPlanController.addMoreIngredient
);
router.post(
  "/update-ingredient",
  isAuthenticated,
  mealPlanController.updateSpecificIngredient
);
router.post(
  "/delete-ingredient",
  isAuthenticated,
  mealPlanController.deleteSpecificIngredient
);

router.get(
  "/delete-custom-meal-plan",
  isAuthenticated,
  mealPlanController.removeAllCustomMealPlan
);

//added
router.post(
  "/reset-diary-custom-meal-plan",
  isAuthenticated,
  mealPlanController.resetDiaryCustomMealPlan
);

module.exports = router;
