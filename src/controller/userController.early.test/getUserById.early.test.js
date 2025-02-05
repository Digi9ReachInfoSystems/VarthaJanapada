// Unit tests for: getUserById

const { getUserById } = require("../userController");
const User = require("../../models/userModel");

// jest.mock("../../../src/models/userModel");

describe("getUserById() getUserById method", () => {
  let req, res;

  beforeEach(() => {
    req = httpMocks.createRequest();
    res = httpMocks.createResponse();
  });

  describe("Happy Paths", () => {
    it("should return user data when a valid user ID is provided", async () => {
      // Arrange
      const userId = "507f1f77bcf86cd799439011";
      const mockUser = { _id: userId, name: "John Doe" };
      req.params.id = userId;
      User.findById.mockResolvedValue(mockUser);

      // Act
      await getUserById(req, res);

      // Assert
      expect(res.statusCode).toBe(200);
      expect(res._getJSONData()).toEqual({ success: true, data: mockUser });
    });
  });

  describe("Edge Cases", () => {
    it("should return 404 when user is not found", async () => {
      // Arrange
      const userId = "507f1f77bcf86cd799439011";
      req.params.id = userId;
      User.findById.mockResolvedValue(null);

      // Act
      await getUserById(req, res);

      // Assert
      expect(res.statusCode).toBe(404);
      expect(res._getJSONData()).toEqual({
        success: false,
        message: "User not found",
      });
    });

    it("should return 500 when there is a database error", async () => {
      // Arrange
      const userId = "507f1f77bcf86cd799439011";
      req.params.id = userId;
      User.findById.mockRejectedValue(new Error("Database error"));

      // Act
      await getUserById(req, res);

      // Assert
      expect(res.statusCode).toBe(500);
      expect(res._getJSONData()).toEqual({
        success: false,
        message: "Database error",
      });
    });

    it("should return 400 for invalid user ID format", async () => {
      // Arrange
      const invalidUserId = "invalid-id";
      req.params.id = invalidUserId;

      // Act
      await getUserById(req, res);

      // Assert
      expect(res.statusCode).toBe(400);
      expect(res._getJSONData()).toEqual({
        success: false,
        message: "Invalid user ID",
      });
    });
  });
});

// End of unit tests for: getUserById
