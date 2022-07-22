const {
  getUserMealPlanList,
  addRemoveDairy,
  createMealPlan,
  getSpecificMeal,
  insertMoreIngredient,
  deleteIngredient,
  updateIngredient,
  getUserCustomMealPlanList,
  updateMealPlan,
  deleteAllUserCustomMeal,
  createCustomMealPlanData, //added
  deleteAllMealPlan, //added
  deleteAddedMeal, //added
  deleteCustomMealPlanData,
  resetDiaryCustomMealPlan, //added
  resetDiaryDeleteCustomMealPlan, //added
  makemealplan, //added
} = require("./../../../repository/MealPlan/meal_plan");

const meal_plan_resources = require("./../../../resources/MealPlan/meal_plan_resources");
const custom_meal_plan_resources = require("./../../../resources/MealPlan/custom_meal_plan_resources");
const specific_meal = require("./../../../resources/MealPlan/specific_meal");
const server_response = require("./../../../util/response");
const customMealPlanData = require("../../../resources/MealPlan/customMealPlanData");

exports.meal_plan_list_by_user_id = (req, res, next) => {
  try {
    const meal_plan = getUserMealPlanList(req.auth.id);
    const custom_meal_plan = getUserCustomMealPlanList(req.auth.id);

    return Promise.all([meal_plan, custom_meal_plan])
      .then((values) => {
        let is_dairy =
          values[0].length > 0 ? values[0][0].dataValues.is_dairy : 0;
        let mealPlanList =
          values[0].length > 0 ? meal_plan_resources(values[0]) : [];
        let customMealPlanList =
          values[1].length > 0 ? custom_meal_plan_resources(values[1]) : [];
        let custom = customMealPlanData(mealPlanList, req);
        if (is_dairy == 0) {
          let addedmeal = deleteAddedMeal(req.auth.id);
          let deleteAllMeal = deleteAllMealPlan(req.auth.id);
          let customMealPlanDataList = createCustomMealPlanData(custom[0].meal);
        }
        server_response(res, 200, "Success!", "Success", {
          is_dairy: values[0].length > 0 ? values[0][0].dataValues.is_dairy : 0,
          meal_plan: mealPlanList,
          custom_meal_plan: customMealPlanList,
        });
      })
      .catch((error) => {
        server_response(res, 500, "Failed", "Something went wrong", {
          error: error,
        });
      });
  } catch (error) {
    server_response(res, 500, "Failed", "Something went wrong", {
      error: error,
    });
  }
};

exports.updateDairy = (req, res, next) => {
  const output = addRemoveDairy(req.auth.id);

  output
    .then((response) => {
      if (response) {
        server_response(res, 200, "True", "Successfully update");
      } else {
        server_response(res, 400, "False", "Data not found");
      }
    })
    .catch((error) => {
      server_response(res, 500, "False", "Something went wrong");
    });
};

// exports.createCustomMeal = (req, res, next) => {
//     let output = createMealPlan(req);
//     output
//         .then((response) => {
//             console.log(response);
//             console.log('here' + '-------------');
//             if (response === 2) {
//                 server_response(res, 422, "False", "Meal Plan already created");
//             } else if (response) {

//                 server_response(res, 200, "True", "Successfully added fuck");
//             } else {
//                 server_response(res, 500, "False", "Something went wrong");
//             }
//         })
//         .catch((error) => {
//             server_response(res, 500, "False", "Something went wrong");
//         });
// };

exports.getSpecificDateMeal = (req, res, next) => {
  let output = getSpecificMeal(req);
  output
    .then((response) => {
      if (response) {
        server_response(res, 200, "True", "Success", {
          data: specific_meal(response),
        });
      } else {
        server_response(res, 200, "True", "Success", { data: [] });
      }
    })
    .catch((error) => {
      server_response(res, 500, "Fail", "Failed", { error: error });
    });
};

exports.createCustomMeal = (req, res, next) => {
  let output = createMealPlan(req);

  output
    .then((response) => {
      if (response === 2) {
        server_response(res, 422, "False", "Meal Plan already created");
      } else if (response) {
        server_response(res, 200, "True", "Successfully added");
      } else {
        server_response(res, 500, "False", "Something went wrong");
      }
    })
    .catch((error) => {
      server_response(res, 500, "False", "Something went wrong");
    });
};

exports.addMoreIngredient = (req, res, next) => {
  const format = {
    item_id: req.body.meal_plan_id,
    ingredient: req.body.food_item_id,
    ingredient_amount: req.body.amount,
    protein: req.body.protein,
    carbo: req.body.carbo,
    fat: req.body.fat,
  };
  const output = insertMoreIngredient(format);
  output
    .then((response) => {
      if (response) {
        server_response(res, 200, "True", "Successfully added item");
      } else {
        server_response(res, 500, "Fail", "Failed", { error: error });
      }
    })
    .catch((error) => {
      server_response(res, 500, "Fail", "Failed", { error: error });
    });
};

exports.deleteSpecificIngredient = (req, res, next) => {
  const result = deleteIngredient(req.body.ingredient_id);
  result
    .then((response) => {
      if (response) {
        server_response(res, 200, "True", "Successfully deleted item");
      } else {
        server_response(res, 500, "Fail", "Failed to deleted item");
      }
    })
    .catch((error) => {
      server_response(res, 500, "Fail", "Failed", { error: error });
    });
};

exports.updateSpecificIngredient = (req, res, next) => {
  let output = updateIngredient(req.body);
  output
    .then((response) => {
      if (response) {
        server_response(res, 200, "True", "Successfully update item");
      } else {
        server_response(res, 406, "Fail", "Failed to update");
      }
    })
    .catch((error) => {
      server_response(res, 500, "Fail", "Failed", { error: error });
    });
};
// resetDiaryCustomMealPlan
exports.resetDiaryCustomMealPlan = (req, res, next) => {
  const meal_plan = getUserMealPlanList(req.auth.id);
  meal_plan
    .then((values) => {
      let is_dairy = values.length > 0 ? values[0].dataValues.is_dairy : 0;
      if (is_dairy == 1) {
        let output = resetDiaryCustomMealPlan(req);
        let deleteMealPlan = resetDiaryDeleteCustomMealPlan(req);
        for (let i = 1; i < 8; i++) {
          let makemeal = makemealplan(req, i);
        }
      }
      server_response(res, 200, "Success!", "Success");
    })
    .catch((error) => {
      server_response(res, 500, "Failed", "Something went wrong", {
        error: error,
      });
    });
};

exports.removeAllCustomMealPlan = (req, res, next) => {
  try {
    let output = deleteAllUserCustomMeal(req.auth.id);
    output
      .then((response) => {
        server_response(res, 200, "True", "Successful");
      })
      .catch((error) => {
        server_response(res, 500, "Fail", "Failed", { error: error });
      });
  } catch (error) {
    server_response(res, 500, "Fail", "Failed", { error: error });
  }
};

// exports.custom_meal_plan_list_by_user_id = (req, res, next) => {
//   try {
//     const response = getUserCustomMealPlanList(req.auth.id);

//     response
//       .then((data) => {
//         if (data === null) {
//           server_response(res, 401, "Failed", "No Data Found");
//         }
//         if (data.length > 0) {
//           server_response(
//               res, 200, 'Success!', 'Success', {
//                   // is_dairy:data[0].dataValues.is_dairy,
//                   data: custom_meal_plan_resources(data),
//                   // data: data,
//               }
//           )
//       }else{
//           server_response(
//               res, 200, 'Success!', 'Success', {
//                   is_dairy:0,
//                   data: [],
//               }
//           )
//       }
//       })
//       .catch((err) => {
//         server_response(res, 500, "Failed", "Something went wrong", {
//           error: err,
//         });
//       });
//   } catch (error) {
//     server_response(res, 500, "Failed", "Something went wrong", {
//       error: error,
//     });
//   }
// };
