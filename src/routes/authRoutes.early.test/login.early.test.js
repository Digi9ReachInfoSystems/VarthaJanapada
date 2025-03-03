
// Unit tests for: login




const  = require('../authRoutes');


// jest.mock("../../models/User");

describe('login() login method', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should return user data when phone number is provided and user is found', async () => {
      // Arrange
      req.body.phone_Number = '1234567890';
      const mockUser = { id: 1, phone_Number: '1234567890', last_logged_in: new Date() };
      User.findOneAndUpdate.mockResolvedValue(mockUser);

      // Act
      await login(req, res);

      // Assert
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { phone_Number: '1234567890' },
        { last_logged_in: expect.any(Date) },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUser });
    });

    it('should return user data when email is provided and user is found', async () => {
      // Arrange
      req.body.email = 'test@example.com';
      const mockUser = { id: 2, email: 'test@example.com', last_logged_in: new Date() };
      User.findOneAndUpdate.mockResolvedValue(mockUser);

      // Act
      await login(req, res);

      // Assert
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { email: 'test@example.com' },
        { last_logged_in: expect.any(Date) },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUser });
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should return 404 when user is not found', async () => {
      // Arrange
      req.body.phone_Number = '0987654321';
      User.findOneAndUpdate.mockResolvedValue(null);

      // Act
      await login(req, res);

      // Assert
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { phone_Number: '0987654321' },
        { last_logged_in: expect.any(Date) },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });

    it('should handle errors gracefully and return 400', async () => {
      // Arrange
      req.body.email = 'error@example.com';
      const errorMessage = 'Database error';
      User.findOneAndUpdate.mockRejectedValue(new Error(errorMessage));

      // Act
      await login(req, res);

      // Assert
      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { email: 'error@example.com' },
        { last_logged_in: expect.any(Date) },
        { new: true }
      );
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ success: false, error: errorMessage });
    });

    it('should handle missing phone number and email in request body', async () => {
      // Act
      await login(req, res);

      // Assert
      expect(User.findOneAndUpdate).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
    });
  });
});

// End of unit tests for: login
