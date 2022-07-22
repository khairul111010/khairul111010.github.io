const { json } = require("body-parser");
const { Promise } = require("sequelize");
const { Op } = require("sequelize");
const {
  UserMealPlan,
  MealPlan,
  BlockCategory,
  Blocks,
  WeekDay,
  MealTypeCategory,
  Ingredient,
  FoodItems,
  user_favorite,
} = require("../../models");
const response = require("../../util/response");

const paginate = require("./../../library/paginate");

const getUserMealPlanList = (userId) => {
  let options = {
    user_id: userId,
  };

  return UserMealPlan.findAll({
    where: options,
    include: [
      {
        model: BlockCategory,
        as: "block_categories",
        include: [
          {
            model: MealPlan,
            as: "meal_plan",
            where: {
              user_id: {
                [Op.is]: null,
              },
            },
            include: [
              {
                model: Blocks,
                as: "block_details",
              },
              {
                model: WeekDay,
                as: "week_day_details",
              },
              {
                model: MealTypeCategory,
                as: "meal_type_category_details",
              },
              {
                model: Ingredient,
                as: "meal_ingredient",
                where: {
                  type_id: 2,
                },
                include: [
                  {
                    model: FoodItems,
                    as: "foodItem",
                    // attributes: ["food_name", "id"],
                    required: false,
                    include: [
                      {
                        model: user_favorite,
                        as: "user_favourite_food_item",
                        where: {
                          user_id: userId,
                          type: "fooditem",
                        },
                        required: false,
                      },
                    ],
                  },
                ],
              },
              {
                model: user_favorite,
                as: "user_favorite_mealPlan",
              },
            ],
            order: ["block_category_id", "desc"],
          },
        ],
      },
    ],
  });
};

const addRemoveDairy = (id) => {
  let check = UserMealPlan.findOne({
    attributes: ["is_dairy"],
    where: {
      user_id: id,
    },
  });

  return check
    .then((response) => {
      if (response != null) {
        const updateValue = response.dataValues.is_dairy == 0 ? 1 : 0;
        let output = UserMealPlan.update(
          { is_dairy: updateValue },
          { where: { user_id: id } }
        );
        return output;
      } else {
        return false;
      }
    })
    .catch((error) => {
      return error;
    });
};

// create meal plan
// custom plan for user
const createMealPlan = (data) => {
  return checkIfMealPlanExist(data)
    .then((existResponse) => {
      if (existResponse === null) {
        return insertCustom(data);
      } else {
        let promises = [];
        // return JSON.parse(data.body.foodItem).forEach((element, index) => {
        //     let format = {
        //         item_id: existResponse.id,
        //         ingredient: element.food_id,
        //         ingredient_amount: element.amount,
        //         protein: element.protein,
        //         carbo: element.carbo,
        //         fat: element.fat
        //     }

        //     return Ingredient.findOne({
        //         where: {
        //             type_id: 2,
        //             ingredient: format.ingredient,
        //             item_id: format.item_id,
        //         },
        //     }).then((obj) => {
        //         // update
        //         if (obj) {
        //             const ingredient_amount = format.ingredient_amount;
        //             return obj.update({
        //                 ingredient_amount:ingredient_amount,
        //                 protein: format.protein,
        //                 carbohydrates: format.carbo,
        //                 fats: format.fat
        //              })
        //         }

        //         // insert
        //         return Ingredient.create({
        //             type_id: 2,
        //             ingredient: format.ingredient,
        //             ingredient_amount: format.ingredient_amount,
        //             item_id: format.item_id,
        //             protein: format.protein,
        //             carbohydrates: format.carbo,
        //             fats: format.fat
        //         })
        //     });

        // })

        return Promise.all(
          JSON.parse(data.body.foodItem).map((element) => {
            let format = {
              item_id: existResponse.id,
              ingredient: element.food_id,
              ingredient_amount: element.amount,
              protein: element.protein,
              carbo: element.carbo,
              fat: element.fat,
            };

            return Ingredient.findOne({
              where: {
                type_id: 2,
                ingredient: format.ingredient,
                item_id: format.item_id,
              },
            }).then((obj) => {
              // update
              if (obj) {
                const ingredient_amount = format.ingredient_amount;
                return obj.update({
                  ingredient_amount: ingredient_amount,
                  protein: format.protein,
                  carbohydrates: format.carbo,
                  fats: format.fat,
                });
              }

              // insert
              return Ingredient.create({
                type_id: 2,
                ingredient: format.ingredient,
                ingredient_amount: format.ingredient_amount,
                item_id: format.item_id,
                protein: format.protein,
                carbohydrates: format.carbo,
                fats: format.fat,
              });
            });
          })
        )
          .then((response) => {
            return Ingredient.findAll({
              where: {
                type_id: 2,
                item_id: existResponse.id,
              },
            })
              .then((ingredients) => {
                var pro = 0;
                var carb = 0;
                var fat = 0;
                ingredients.map((item) => {
                  // pro += parseInt(item.protein)

                  pro += parseInt(item.protein);
                  carb += parseInt(item.carbohydrates);
                  fat += parseInt(item.fats);
                });

                return MealPlan.findOne({
                  where: { id: existResponse.id },
                }).then((obj) => {
                  if (obj) {
                    return obj.update({
                      protein: pro,
                      carb: carb,
                      fat: fat,
                    });
                  }
                });
              })
              .catch((error) => {
                return false;
              });
          })
          .catch((error) => {
            return false;
          });

        // return true;
      }
    })
    .catch((error) => {
      return false;
    });
};

// insert private function
const insertCustom = (data) => {
  let meal_ingredients = [];
  JSON.parse(data.body.foodItem).forEach((element) => {
    meal_ingredients.push({
      type_id: 2,
      ingredient: element.food_id,
      ingredient_amount: element.amount,
      protein: element.protein,
      carbohydrates: element.carbo,
      fats: element.fat,
    });
  });
  return MealPlan.create(
    {
      block_category_id: data.body.block_category_id,
      block_id: data.body.block_id,
      meal_type_cat_id: data.body.meal_type_cat_id,
      week_day_id: data.body.week_day_id,
      title: data.body.title,
      user_id: data.auth.id,
      protein: data.body.protein,
      carb: data.body.carb,
      fat: data.body.fat,
      meal_ingredient: meal_ingredients,
    },
    {
      include: [
        {
          association: "meal_ingredient",
        },
      ],
    }
  );
};
// end insert private function

const checkIfMealPlanExist = (data) => {
  return MealPlan.findOne({
    where: {
      // block_category_id: data.body.block_category_id,
      // block_id: data.body.block_id,
      meal_type_cat_id: data.body.meal_type_cat_id,
      week_day_id: data.body.week_day_id,
      user_id: data.auth.id,
    },
  });
};

//checkif customMealPlanDataExists
const customMealPlanDataExists = (
  block_category_id,
  block_id,
  meal_type_cat_id,
  week_day_id,
  user_id
) => {
  return MealPlan.findOne({
    where: {
      [Op.and]: [
        { block_category_id: block_category_id },
        { block_id: block_id },
        { meal_type_cat_id: meal_type_cat_id },
        { week_day_id: week_day_id },
        { user_id: user_id },
      ],
    },
  });
};
//checkif customMealPlanUserDataExists
const customMealPlanUserDataExists = (user_id) => {
  return MealPlan.findAll({
    where: { user_id: user_id },
  });
};

// delete Meal Plan and Ingredent
const deleteMealPlanWithRelation = (id) => {
  return MealPlan.destroy({
    where: {
      id: id,
    },
  }).then((response) => {
    Ingredient.destroy({
      where: {
        item_id: id,
        type_id: 2,
      },
    });
  });
};

const updateMealPlan = (id, protein, carb, fat) => {
  return MealPlan.findOne({ where: { id } }).then((obj) => {
    if (obj) {
      return obj.update({
        protein: parseInt(obj.protein) + parseInt(protein),
        carb: parseInt(obj.carb) + parseInt(carb),
        fat: parseInt(obj.fat) + parseInt(fat),
      });
    }
  });
};

// get specific meal plan
const getSpecificMeal = (data) => {
  return MealPlan.findAll({
    where: {
      meal_type_cat_id: data.query.meal_type_id,
      week_day_id: data.query.week_day_id,
      user_id: data.auth.id,
    },
    include: [
      {
        model: Ingredient,
        as: "meal_ingredient",
        where: {
          type_id: 2,
        },
        required: false,
        include: [
          {
            model: FoodItems,
            as: "foodItem",
            required: false,
          },
        ],
      },
      {
        model: user_favorite,
        as: "user_favorite_mealPlan",
        required: false,
      },
      {
        model: MealTypeCategory,
        as: "meal_type_category_details",
      },
    ],
  });
};

const insertOrUpdateUserMealPlan = (userId, blockCatId) => {
  return UserMealPlan.findOne({ where: { user_id: userId } }).then((obj) => {
    // update
    if (obj) return obj.update({ block_categories_id: blockCatId });
    // insert
    return UserMealPlan.create({
      user_id: userId,
      block_categories_id: blockCatId,
    });
  });
};

const insertMoreIngredient = (data) => {
  return Ingredient.findOne({
    where: {
      type_id: 2,
      ingredient: data.ingredient,
      item_id: data.item_id,
    },
  }).then((obj) => {
    // update
    if (obj) {
      const ingredient_amount = data.ingredient_amount;
      let oldProtein = obj.protein;
      let oldCarbo = obj.carbohydrates;
      let oldFat = obj.fats;

      return obj
        .update({
          ingredient_amount: ingredient_amount,
          protein: data.protein,
          carbohydrates: data.carbo,
          fats: data.fat,
        })
        .then((response) => {
          let newPro = parseInt(data.protein) - parseInt(oldProtein);
          let newCarb = parseInt(data.carbo) - parseInt(oldCarbo);
          let newFat = parseInt(data.fat) - parseInt(oldFat);

          return updateMealPlan(data.item_id, newPro, newCarb, newFat);
        })
        .catch((error) => {
          return false;
        });
    }

    // insert
    return Ingredient.create({
      type_id: 2,
      ingredient: data.ingredient,
      ingredient_amount: data.ingredient_amount,
      item_id: data.item_id,
      protein: data.protein,
      carbohydrates: data.carbo,
      fats: data.fat,
    })
      .then((response) => {
        return updateMealPlan(data.item_id, data.protein, data.carbo, data.fat);
      })
      .catch((error) => {
        return false;
      });
  });
};

// update ingredient
const updateIngredient = (data) => {
  return Ingredient.findOne({
    where: {
      id: data.id,
    },
  })
    .then((obj) => {
      if (obj != null) {
        const ingredient_amount = data.amount;
        let oldProtein = obj.protein;
        let oldCarbo = obj.carbohydrates;
        let oldFat = obj.fats;

        return obj
          .update({
            ingredient_amount: ingredient_amount,
            protein: data.protein,
            carbohydrates: data.carbo,
            fats: data.fat,
          })
          .then((response) => {
            let newPro = parseInt(data.protein) - parseInt(oldProtein);
            let newCarb = parseInt(data.carbo) - parseInt(oldCarbo);
            let newFat = parseInt(data.fat) - parseInt(oldFat);

            return updateMealPlan(obj.item_id, newPro, newCarb, newFat);
          })
          .catch((error) => {
            return false;
          });
      } else {
        return false;
      }
    })
    .catch((error) => {
      return error;
    });
};

const deleteIngredient = (id) => {
  return Ingredient.findOne({
    where: {
      id: id,
    },
  })
    .then((obj) => {
      let oldProtein = obj.protein;
      let oldCarbo = obj.carbohydrates;
      let oldFat = obj.fats;
      let mealPlanId = obj.item_id;

      if (obj != null) {
        return obj
          .destroy()
          .then((response) => {
            return MealPlan.findOne({ where: { id: mealPlanId } }).then(
              (mealplanObj) => {
                if (obj) {
                  return mealplanObj.update({
                    protein:
                      parseInt(mealplanObj.protein) - parseInt(oldProtein),
                    carb: parseInt(mealplanObj.carb) - parseInt(oldCarbo),
                    fat: parseInt(mealplanObj.fat) - parseInt(oldFat),
                  });
                }
              }
            );
          })
          .catch((error) => {
            return false;
          });
      } else {
        return false;
      }
    })
    .catch((error) => {
      return false;
    });
};
//Added
const deleteAddedMeal = (id) => {
  return MealPlan.findAll({
    where: {
      [Op.and]: [{ user_id: id }, { block_id: 1 }, { block_category_id: 1 }],
    },
  }).then((response) => {
    response.map((item) => {
      return MealPlan.destroy({
        where: {
          id: item.dataValues.id,
        },
      });
    });
  });
};

//Added
const deleteAllMealPlan = (data) => {
  return MealPlan.findAll({
    where: {
      user_id: data,
    },
  }).then((response) => {
    response.map((result) => {
      return Ingredient.destroy({
        where: {
          item_id: result.dataValues.id,
        },
      });
    });
  });
};

//Added
const createCustomMealPlanData = (mealplan) => {
  try {
    mealplan.forEach((element) => {
      element.data.forEach((meal) => {
        let meal_ingredients = [];
        meal.food.forEach((item) => {
          meal_ingredients.push({
            type_id: 2,
            ingredient: item.ingredient,
            ingredient_amount: item.ingredient_amount,
            protein: item.protein,
            carbohydrates: item.carbohydrates,
            fats: item.fats,
          });
        });

        customMealPlanDataExists(
          element.block_category_id,
          meal.block_id,
          meal.meal_type_cat_id,
          element.week_day_id,
          element.user_id
        ).then((response) => {
          if (response == null) {
            MealPlan.create(
              {
                user_id: element.user_id,
                block_category_id: element.block_category_id,
                block_id: meal.block_id,
                meal_type_cat_id: meal.meal_type_cat_id,
                week_day_id: element.week_day_id,
                title: meal.title,
                protein: meal.protein,
                carb: meal.carb,
                fat: meal.fat,
                meal_ingredient: meal_ingredients,
              },
              {
                include: [
                  {
                    association: "meal_ingredient",
                  },
                ],
              }
            ).then((result) => {
              console.log("Meal Plan Added!");
            });
          } else {
          }
        });
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};

//deleteCustomMealPlanData
const deleteCustomMealPlanData = (mealplan) => {
  try {
    mealplan.forEach((element) => {
      element.data.forEach((meal) => {
        let meal_ingredients = [];
        meal.food.forEach((item) => {
          meal_ingredients.push({
            type_id: 2,
            ingredient: item.ingredient,
            ingredient_amount: item.ingredient_amount,
            protein: item.protein,
            carbohydrates: item.carbohydrates,
            fats: item.fats,
          });
        });

        customMealPlanUserDataExists(element.user_id).then((response) => {
          if (response) {
            response.map((r) => {
              MealPlan.destroy({
                where: {
                  id: r.dataValues.id,
                  user_id: element.user_id,
                },
              }).then((result) => {
                Ingredient.destroy({
                  where: {
                    item_id: r.dataValues.id,
                  },
                });
              });
            });
          } else {
          }
        });
      });
    });
  } catch (error) {
    console.log(error.message);
  }
};
//added
const resetDiaryCustomMealPlan = (data) => {
  return MealPlan.findAll({
    where: {
      user_id: data.auth.id,
      week_day_id: data.body.week_day_id,
    },
  }).then((response) => {
    response.map((result) => {
      // console.log(result.dataValues.id);
      return Ingredient.destroy({
        where: {
          item_id: result.dataValues.id,
        },
      });
    });
  });
};
//added
const resetDiaryDeleteCustomMealPlan = (data) => {
  return MealPlan.findAll({
    where: {
      user_id: data.auth.id,
      week_day_id: data.body.week_day_id,
    },
  }).then((response) => {
    response.map((result) => {
      // console.log(result.dataValues.id);
      return MealPlan.destroy({
        where: {
          id: result.dataValues.id,
        },
      });
    });
  });
};
//added
const makemealplan = (req, i) => {
  return MealPlan.create({
    block_category_id: 1,
    block_id: 1,
    meal_type_cat_id: i,
    week_day_id: req.body.week_day_id,
    title: "",
    user_id: req.auth.id,
  });
};

// temporary
const createMealPlanTemp = (data) => {
  let meal_ingredients = [];
  data.body.foodItem.forEach((element) => {
    meal_ingredients.push({
      type_id: 2,
      ingredient: element.food_id,
      ingredient_amount: element.amount,
      protein: element.protein,
      carbohydrates: element.carbo,
      fats: element.fat,
    });
  });
  return MealPlan.create(
    {
      block_category_id: data.body.block_category_id,
      block_id: data.body.block_id,
      meal_type_cat_id: data.body.meal_type_cat_id,
      week_day_id: data.body.week_day_id,
      title: data.body.title,
      protein: data.body.protein,
      carb: data.body.carb,
      fat: data.body.fat,
      meal_ingredient: meal_ingredients,
    },
    {
      include: [
        {
          association: "meal_ingredient",
        },
      ],
    }
  );
};

const getUserCustomMealPlanList = (userId) => {
  let options = {
    user_id: userId,
  };

  return MealPlan.findAll({
    where: options,
    include: [
      {
        model: BlockCategory,
        as: "user_meal_plan_block_cat",
      },
      {
        model: Blocks,
        as: "block_details",
      },
      {
        model: WeekDay,
        as: "week_day_details",
      },
      {
        model: MealTypeCategory,
        as: "meal_type_category_details",
      },
      {
        model: Ingredient,
        as: "meal_ingredient",
        where: {
          type_id: 2,
        },
        required: false,
        include: [
          {
            model: FoodItems,
            as: "foodItem",
            // attributes: ["food_name", "id"],
            required: false,
            include: [
              {
                model: user_favorite,
                as: "user_favourite_food_item",
                where: {
                  user_id: userId,
                  type: "fooditem",
                },
                required: false,
              },
            ],
          },
        ],
      },
      {
        model: user_favorite,
        as: "user_favorite_mealPlan",
      },
    ],
  });
};

const deleteAllUserCustomMeal = (user_id) => {
  return MealPlan.findAll({
    where: {
      user_id,
    },
    attributes: ["id"],
  })
    .then((result) => {
      // console.log(result);
      let deleteItems = result.map((item) => item.id);
      return deleteMealPlanWithRelation(deleteItems);
    })
    .catch((error) => {
      return false;
    });
};

module.exports = {
  getUserMealPlanList,
  addRemoveDairy,
  createMealPlan,
  getSpecificMeal,
  insertOrUpdateUserMealPlan,
  insertMoreIngredient,
  deleteIngredient,
  createMealPlanTemp,
  updateIngredient,
  getUserCustomMealPlanList,
  updateMealPlan,
  deleteAllUserCustomMeal,
  createCustomMealPlanData,
  deleteCustomMealPlanData,
  resetDiaryCustomMealPlan,
  resetDiaryDeleteCustomMealPlan,
  deleteAllMealPlan,
  makemealplan,
  deleteAddedMeal,
};
