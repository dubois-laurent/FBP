using FluentValidation;
using FBP.Api.DTOs.Events;
using FBP.Api.Models;

namespace FBP.Api.Validators
{
    public class CreateEventValidator : AbstractValidator<CreateEventRequest>
    {
        public CreateEventValidator()
        {
            RuleFor(x => x.Title).NotEmpty().WithMessage("Title is required");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required")
                .MinimumLength(10).WithMessage("Description must be at least 10 characters");

            RuleFor(x => x.Date)
                .NotEmpty().WithMessage("Date is required")
                .Must(BeValidDate).WithMessage("Date must be a valid ISO date");

            RuleFor(x => x.Venue).NotEmpty().WithMessage("Venue is required");

            RuleFor(x => x.TotalSeats)
                .GreaterThan(0).WithMessage("Total seats must be greater than 0");

            RuleFor(x => x.Type)
                .NotEmpty().WithMessage("Type is required")
                .Must(EventType.IsValid).WithMessage("Type must be one of: exposition, conference, atelier, rencontre");
        }

        private static bool BeValidDate(string date)
        {
            System.DateTime result;
            return !string.IsNullOrEmpty(date) && System.DateTime.TryParse(date, out result);
        }
    }
}
