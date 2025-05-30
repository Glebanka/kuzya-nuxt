
export const CalendarDOMTemplate = {
	default: `
			<div class="vanilla-calendar-header">
				<div class="vanilla-calendar-header__content ">
					<#Month /> <#Year />
				</div>
				<#ArrowPrev />
				<#ArrowNext />
			</div>
			<div class="vanilla-calendar-wrapper">
				<#WeekNumbers />
				<div class="vanilla-calendar-content">
					<#Week />
					<#Days />
				</div>
			</div>
			<#ControlTime />
		`,
	month: `
			<div class="vanilla-calendar-header">
				<div class="vanilla-calendar-header__content">
					<#Month /> | <#Year />
				</div>
			</div>
			<div class="vanilla-calendar-wrapper">
				<div class="vanilla-calendar-content">
					<#Months />
				</div>
			</div>
		`,
	year: `
			<div class="vanilla-calendar-header">
				<div class="vanilla-calendar-header__content">
					<#Month /> | <#Year />
				</div>
				<#ArrowPrev />
				<#ArrowNext />
			</div>
			<div class="vanilla-calendar-wrapper">
				<div class="vanilla-calendar-content">
					<#Years />
				</div>
			</div>
		`,
}