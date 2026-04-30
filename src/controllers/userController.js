const userService = require("../services/userService");
const { success } = require("../utils/apiResponse");

function listUsers(req, res, next) {
  try {
    res.status(200).json(success(userService.listUsers()));
  } catch (error) {
    next(error);
  }
}

function getUser(req, res, next) {
  try {
    res.status(200).json(success(userService.getUserById(req.params.id)));
  } catch (error) {
    next(error);
  }
}

function createUser(req, res, next) {
  try {
    res.status(201).json(success(userService.createUser(req.body), "Usuário criado com sucesso."));
  } catch (error) {
    next(error);
  }
}

function updateUser(req, res, next) {
  try {
    res.status(200).json(success(userService.updateUser(req.params.id, req.body), "Usuário atualizado com sucesso."));
  } catch (error) {
    next(error);
  }
}

function deleteUser(req, res, next) {
  try {
    res.status(200).json(success(userService.deleteUser(req.params.id), "Usuário inativado com sucesso."));
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser
};
