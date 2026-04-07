const ClothingItem = require("../models/clothingItem");
const BadRequestError = require("../errors/bad-request-err");
const ForbiddenError = require("../errors/forbidden-err");
const NotFoundError = require("../errors/not-found-err");

const getClothingItems = (req, res, next) => {
  ClothingItem.find({})
    .then((clothingItems) => res.status(200).send(clothingItems))
    .catch(next);
};

const createClothingItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  ClothingItem.create({ name, weather, imageUrl, owner: req.user._id })
    .then((clothingItem) => res.status(201).send(clothingItem))
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError(err.message));
      } else {
        next(err);
      }
    });
};

const updateClothingItem = (req, res, next) => {
  const { name, weather, imageUrl } = req.body;
  ClothingItem.findByIdAndUpdate(req.params.itemId, {
    name,
    weather,
    imageUrl,
  })
    .orFail()
    .then((clothingItem) => res.status(200).send(clothingItem))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("Clothing item not found"));
      } else if (err.name === "CastError") {
        next(new BadRequestError("Invalid clothing item ID"));
      } else {
        next(err);
      }
    });
};

const deleteClothingItem = (req, res, next) => {
  ClothingItem.findById(req.params.itemId)
    .orFail()
    .then((item) => {
      if (item.owner.toString() !== req.user._id) {
        throw new ForbiddenError(
          "You are not authorized to delete this item"
        );
      }
      return item
        .deleteOne()
        .then(() => res.status(200).send({ message: "Item deleted" }));
    })
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("Clothing item not found"));
      } else if (err.name === "CastError") {
        next(new BadRequestError("Invalid clothing item ID"));
      } else {
        next(err);
      }
    });
};

const likeItem = (req, res, next) =>
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((item) => res.status(200).send(item))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("Clothing item not found"));
      } else if (err.name === "CastError") {
        next(new BadRequestError("Invalid clothing item ID"));
      } else {
        next(err);
      }
    });

const dislikeItem = (req, res, next) =>
  ClothingItem.findByIdAndUpdate(
    req.params.itemId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .orFail()
    .then((item) => res.status(200).send(item))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError("Clothing item not found"));
      } else if (err.name === "CastError") {
        next(new BadRequestError("Invalid clothing item ID"));
      } else {
        next(err);
      }
    });

module.exports = {
  getClothingItems,
  createClothingItem,
  updateClothingItem,
  deleteClothingItem,
  likeItem,
  dislikeItem,
};
