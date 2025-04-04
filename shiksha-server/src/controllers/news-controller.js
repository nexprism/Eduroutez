import fs from "fs/promises";
import path from "path";
import { StatusCodes } from "http-status-codes";
import { FileUpload } from "../middlewares/index.js";
import { SuccessResponse, ErrorResponse } from "../utils/common/index.js";
import NewsService from "../services/news-service.js";
import UserService from "../services/user-service.js";
// import InstituteService from "../services/institute-service.js";

const multiUploader = FileUpload.upload.fields([
  {
    name: "image",
    maxCount: 1,
  }
]);
const newsService = new NewsService();
const usersevice = new UserService();

/**
 * POST : /blog
 * req.body {}
 */


/**
 * POST : /news
 * req.body {}
 */
export const createNews = async (req, res) => {
  try {
    const instituteId = req.user;
    console.log('instituteId',instituteId);

  

    multiUploader(req, res, async function (err) {
      if (err) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err });
      }

      const payload = { ...req.body };
        if (req.files && req.files["image"]) {
            payload.image = req.files["image"][0].filename;
      }

      //check if institute exists
        // const institute = await instituteService.getInstituteById(instituteId);
        // if (!institute) {
        //     throw new AppError("Institute not found", StatusCodes.NOT_FOUND);
        // }

// search user by id if role is SUPER_ADMIN then send null in institute key
        const user = await usersevice.getUserById(instituteId);
        if(user.role === 'SUPER_ADMIN'){  
          payload.institute = null;
        }else{


      payload.institute = instituteId;
        }

      if(payload.title){
        payload.slug = payload.title.toLowerCase().replace(/ /g, "-");
      }

      const response = await newsService.create(payload);

      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully created a new news article";

      return res.status(StatusCodes.CREATED).json(SuccessResponse);
    });
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.statusCode).json(ErrorResponse);
  }
};

/**
 * GET : /news
 * req.body {}
 */
export async function getNews(req, res) {
  try {
    const response = await newsService.getAll(req.query);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched news articles";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.error("Error fetching news:", error);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

/**
 * GET : /news/:id
 * req.body {}
 */
export async function getNewsById(req, res) {
  try {
    const id = req.params.id;
    var field = '_id';
    if (req.query.field) {
      field = req.query.field;
    }
    const response = await newsService.get(id, field);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the news article";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    console.log('neew error',error.message);
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}


//getNewsByInstitute
export async function getNewsByInstitute(req, res) {
  try {
    
    const user = await usersevice.getUserById(req.params.institute);
    if(user.role !== 'institute'){
      const response = await newsService.getAllNews();
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the news article";
    return res.status(StatusCodes.OK).json(SuccessResponse);
    }else{
      const response = await newsService.getNewsByInstitute(req.params.institute);
      SuccessResponse.data = response;
      SuccessResponse.message = "Successfully fetched the news article";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    }
  } catch (error) {
    ErrorResponse.error = error;
    console.log('error',error.message);
    return res.status(error.statusCode).json(ErrorResponse);
  }
}

// getnewaapi where institute key role is Super_admin
export async function getNewsBySuperAdmin(req, res) {
  try {
    const response = await newsService.getAllNewsofSuperAdmin();
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully fetched the news article";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    console.log('error',error.message);
    return res.status(error.statusCode).json(ErrorResponse);
  }
}


/**
 * PATCH : /news/:id
 * req.body {title: "New Title"}
 */
export async function updateNews(req, res) {
  multiUploader(req, res, async (err) => {
    if (err) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "File upload error", details: err });
    }

    try {
      const newsId = req.params.id;
      const instituteId = req.user;
      const payload = {};
      let oldImagePath;

      if (req.body.title) {
        payload.title = req.body.title;
        payload.slug = req.body.title.toLowerCase().replace(/ /g, "-");
      }
      if (req.body.description) {
        payload.description = req.body.description;
      }

       if (req.files && req.files["image"]) {
            payload.image = req.files["image"][0].filename;
      }

      payload.institute = instituteId;

        const news = await newsService.update(newsId, payload);

      if (oldImagePath) {
        try {
          fs.unlink(oldImagePath);
        } catch (unlinkError) {
          console.error("Error deleting old image:", unlinkError);
        }
      }

      SuccessResponse.data = news;
      SuccessResponse.message = "Successfully updated the news article";
      return res.status(StatusCodes.OK).json(SuccessResponse);
    } catch (error) {
      console.error("Update news error:", error.message);
      ErrorResponse.error = error;
      return res.status(error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR).json(ErrorResponse);
    }
  });
}

/**
 * DELETE : /news/:id
 * req.body {}
 */
export async function deleteNews(req, res) {
  try {
    const response = await newsService.delete(req.params.id);
    SuccessResponse.data = response;
    SuccessResponse.message = "Successfully deleted the news article";
    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;
    return res.status(error.statusCode).json(ErrorResponse);
  }
}
