using FluentValidation;
using FBP.Api.DTOs.Bookings;
using FBP.Api.DTOs.Messages;
using FBP.Api.DTOs.Users;

namespace FBP.Api.Validators
{
    public class CreateBookingValidator : AbstractValidator<CreateBookingRequest>
    {
        public CreateBookingValidator()
        {
            RuleFor(x => x.EventId)
                .NotEmpty().WithMessage("eventId is required")
                .Must(BeValidGuid).WithMessage("eventId must be a valid UUID");
        }

        private static bool BeValidGuid(string id)
        {
            System.Guid result;
            return !string.IsNullOrEmpty(id) && System.Guid.TryParse(id, out result);
        }
    }

    public class SendMessageValidator : AbstractValidator<SendMessageRequest>
    {
        public SendMessageValidator()
        {
            RuleFor(x => x.ReceiverId)
                .NotEmpty().WithMessage("receiverId is required")
                .Must(BeValidGuid).WithMessage("receiverId must be a valid UUID");

            RuleFor(x => x.Content)
                .NotEmpty().WithMessage("content is required")
                .MaximumLength(2000).WithMessage("content must not exceed 2000 characters");
        }

        private static bool BeValidGuid(string id)
        {
            System.Guid result;
            return !string.IsNullOrEmpty(id) && System.Guid.TryParse(id, out result);
        }
    }

    public class UpdateProfileValidator : AbstractValidator<UpdateProfileRequest>
    {
        public UpdateProfileValidator()
        {
            When(x => !string.IsNullOrEmpty(x.Name), () =>
            {
                RuleFor(x => x.Name)
                    .MinimumLength(2).WithMessage("Name must be at least 2 characters")
                    .MaximumLength(255).WithMessage("Name must not exceed 255 characters");
            });

            When(x => !string.IsNullOrEmpty(x.Password), () =>
            {
                RuleFor(x => x.Password)
                    .MinimumLength(6).WithMessage("Password must be at least 6 characters")
                    .MaximumLength(72).WithMessage("Password must not exceed 72 characters");
            });
        }
    }
}
