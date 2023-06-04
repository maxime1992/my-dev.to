---
published: true
title: "Building scalable robusts and type safe forms with Angular"
cover_image: "https://raw.githubusercontent.com/maxime1992/my-dev.to/master/blog-posts/building-scalable-robusts-and-type-safe-forms-with-angular/assets/sub-forms-schema.png"
description:
tags: angular, typescript, reactiveForms
series:
canonical_url:
---

Hi there :wave:!

Today I'd like to share some of my experience in building (what I think are) large and complex forms with Angular. One thing to keep in mind though; if you don't feel concerned by the "scalable" or "large forms" parts, be aware that all of the following can be still be applied to super tiny forms and you'll still get a lot of benefits!

_Disclaimer: I have not been the only one spending hours to think about a better way of handling forms. Zak Henry ([@zak](https://twitter.com/zak)) and I both came up to the solution I'll be introducing today and I'd like to thank him for all the time he has spent thinking on the design, coding, and making code reviews too :clap: :clap: :clap:._

# Table of contents

- [Context](#context)
- [Introduction to the demo and understand what we want to build as an example](#introduction-the-demo-and-understand-what-we-want-to-build-as-an-example)
- [Reactive forms](#reactive-forms)
  - [Everything in one file](#everything-in-one-file-fire)
  - [Breaking down the form into sub components](#breaking-down-the-form-into-sub-components-thumbsup)
  - [Breaking down the form into sub components, the right way!](#breaking-down-the-form-into-sub-components-the-right-way-tada)
  - [Understanding the power of ControlValueAccessor](#understanding-the-power-of-raw-controlvalueaccessor-endraw-)
- [Ngx-Sub-Form: Utility library to break down an Angular form into multiple sub components](#ngxsubform-utility-library-to-break-down-an-angular-form-into-multiple-sub-components)
  - [What ngx-sub-form has to offer](#what-raw-ngxsubform-endraw-has-to-offer)
  - [When should you use it?](#when-should-you-use-it)
  - [Building the demo](#building-the-demo)
  - [Going further with remapping and/or polymorphism](#going-further-with-remapping-andor-polymorphism)
- [Summary and take away](#summary-and-take-away)
- [Useful links](#useful-links)

# Context

Before we dig into the main topic, let me give you a little bit of context to explain why I am building large forms at work and why I really needed to find a solution doing a better job at this.

I'm currently working at [CloudNC](https://cloudnc.com), a startup in London where we aim to greatly simplify, speed up and improve the process of machining a part using a [CNC milling machine](https://youtu.be/Dh1eUb_UWUQ?t=8). Within our application, we need to model the environment (machines, tools, etc) as input to algorithms that generate the machine movements. This environment has a huge number of parameters, so we have quite a lot of forms.

![](https://thepracticaldev.s3.amazonaws.com/i/sgrwp78td5w2loat4ulj.png)
_3D visualiser to simulate how the machine is going to cut the part._

A good example with one of our forms is when we want to annotate a specific hole on a part. We can choose amongst different types of annotations and select a specific behavior:

![](https://thepracticaldev.s3.amazonaws.com/i/zf5h3re7gnsn7pfgdwdd.png)
_Example of 2 forms to annotate a hole._

With this example you can see we have two separate forms, each selected by one dropdown (this forms a polymorphic model - explained later!). Each of those forms uses the same "Spotting Strategy" sub form. This isn't even our most complex form, so you can begin to understand the motivation to come up with a generic solution for breaking up forms into logical components that can be easily composed.

# Introduction to the demo and understand what we want to build as an example

In order to showcase when it could be difficult to properly build a good form, we've built an app. The main idea being: "Galactic sales" where someone can decide to sell either a `Droid` (`Assassin`, `Astromech`, `Medical`, `Protocol`) or a `Vehicle` (`Spaceship`, `Speeder`).

![](https://thepracticaldev.s3.amazonaws.com/i/dpkth2zu4axvrnqh23bn.png)

On the left, you can see a simple list showing the items for sale.

On the right, there's a form showing the item that has been clicked (so it can be edited, think of it as an admin view). It's also possible to create a new entry by clicking the "Create new" button.

If you want to play with the **live version** of the demo, you can have a go here: https://cloudnc.github.io/ngx-sub-form  
If you want to take a look into the source code of the demo, you can go here: https://github.com/cloudnc/ngx-sub-form/tree/master/src/app

Now let's take a closer look at the models (`interfaces`, `enums`, etc) to build a simplified version of it. Enough to understand all the concepts but avoid repetition.

A `Listing` is an item for sale:

```typescript
// can either be a vehicle or a droid
export enum ListingType {
  VEHICLE = 'Vehicle',
  DROID = 'Droid',
}

export interface BaseListing {
  id: string;
  title: string;
  imageUrl: string;
  price: number;
}

export interface VehicleListing extends BaseListing {
  listingType: ListingType.VEHICLE;
  product: OneVehicle;
}

export interface DroidListing extends BaseListing {
  listingType: ListingType.DROID;
  product: OneDroid;
}

export type OneListing = VehicleListing | DroidListing;
```

Let's take a look at the `Vehicle` model for now:

```typescript
export enum VehicleType {
  SPACESHIP = 'Spaceship',
  SPEEDER = 'Speeder',
}

export interface BaseVehicle {
  color: string;
  canFire: boolean;
  numberOfPeopleOnBoard: number;
}

export interface Spaceship extends BaseVehicle {
  vehicleType: VehicleType.SPACESHIP;
  numberOfWings: number;
}

export interface Speeder extends BaseVehicle {
  vehicleType: VehicleType.SPEEDER;
  maximumSpeed: number;
}

export type OneVehicle = Spaceship | Speeder;
```

One important thing to note here, is that `OneListing` is a polymorphic type (and so is `OneVehicle`):

```ts
export type OneListing = VehicleListing | DroidListing;
```

The object that will hold a value here can either be a `VehicleListing` or a `DroidListing`. Typescript could ensure type safety in that case only by looking at the properties, but to be safer and also later have an easy way of knowing the type of an object, we use a discriminant property: `listingType`.

Now let's move on to the next step and understand the challenge of building a form that can represent that data structure.

# Reactive forms

They've been introduced in the early versions of Angular and completely changed the way to reason about forms. In a good way! Instead of managing all the logic of our forms from the templates, we can manage it from our Typescript/Components files. Plus we can enjoy type safety on all of our forms!

![](https://thepracticaldev.s3.amazonaws.com/i/prlx7do0rrb70kpw5tyq.png)

Well... Not exactly. There's a long standing issue on Github.

{% github https://github.com/angular/angular/issues/13721 %}

_I invite you to show some support by putting a :+1: on the post so that it eventually can be prioritised._

Even though we can't really benefit from type safety currently, we can still build it using a reactive form. Let's walk through the different solutions to do so.

## Everything in one file :fire:

One solution would be to put everything in the same component. As you can imagine, this is far from ideal:

- Huge file
- Hard to work on the same file in parallel with multiple developers
- Not splitting the logic in different groups to break down the problem into smaller pieces
- Can't reuse sub parts of the form (to edit only a smaller subset for example)

## Breaking down the form into sub components :thumbsup:

So just like you would with any other component or function, you start to think about how to break it down into simpler and smaller sub components handling their own logic. From there, you'll probably find a few blog posts and Stack Overflow questions that recommend to pass the form group instance as an `@Input()` and then from a sub component dynamically add the required new form properties.

But something doesn't feel right, does it? If it wasn't a form, just a simple object, would you pass the `Listing` object to a `Vehicle` component? It'd then have access to the property `listing.vehicle` which is fine, but also the `listing` itself, which feels dangerous. Worst, it'd be able to mutate `listing.vehicle` (to add/remove properties). Following the one way data binding principle, you realize this would be wrong. I think this also applies to forms.

## Breaking down the form into sub components, the right way! :tada:

[Kara](https://twitter.com/karaforthewin) talked about `ControlValueAccessor` in this brilliant talk at Angular Connect in 2017: https://youtu.be/CD_t3m2WMM8

In case you've never heard of `ControlValueAccessor`, it'll let you create a component that can be used as a `FormControl`. Basically, you could do something like the following:

```ts
@Component({
  selector: 'my-custom-input',
  // ...
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MyCustomInput),
      multi: true,
    },
  ],
})
export class MyCustomInput implements ControlValueAccessor {
  writeValue(obj: any): void {
    // every time the form control is
    // being updated from the parent
  }
  registerOnChange(fn: any): void {
    // when we want to let the parent
    // know that the value of the
    // form control should be updated
    // call `fn` callback
  }
  registerOnTouched(fn: any): void {
    // when we want to let the parent
    // know that the form control
    // has been touched
    // call `fn` callback
  }
  setDisabledState?(isDisabled: boolean): void {
    // when the parent updates the
    // state of the form control
  }
}
```

Can you spot the main difference between passing the `FormGroup` instance and using `ControlValueAccessor`? It's now pretty much the same pattern that we use when we make a dumb component!

The following is not something available in Angular but just to make my point, you could think of it this way:

```ts
  @Input() set value(obj: any) {}
  @Input() set disabledState(isDisabled: boolean): void {}

  @Output() updated: EventEmitter<any> = new EventEmitter();
  @Output() touched: EventEmitter<any> = new EventEmitter();
```

Note that:

- The one way data flow is respected
- The sub component doesn't have access to the whole form

If you take a look into into Angular Material source code, you'll notice that it is how a lot of components (acting as inputs) are built! For example, [select](https://github.com/angular/components/blob/c3eac1759c80a6cb34dc1d74215fce97b81316d7/src/material/select/select.ts#L228), [radio](https://github.com/angular/components/blob/c3eac1759c80a6cb34dc1d74215fce97b81316d7/src/material/radio/radio.ts#L98), [slide-toggle](https://github.com/angular/components/blob/c3eac1759c80a6cb34dc1d74215fce97b81316d7/src/material/slide-toggle/slide-toggle.ts#L104), [slider](https://github.com/angular/components/blob/c3eac1759c80a6cb34dc1d74215fce97b81316d7/src/material/slider/slider.ts#L149), ...

## Understanding the power of `ControlValueAccessor`

While writing the previous example, I've created an empty class that implements `ControlValueAccessor` and then my IDE generated the required methods. But let's take a closer look at one of them:

```ts
writeValue(obj: any): void
```

Have you noticed the name of the parameter? `obj`. That is interesting :thinking:.

You can pass any kind of object to `writeValue`! You're not limited to the primitive types like `string` or `number`. You can pass an object, an array, ... Everything we need to start building **deeply nested forms**.

So, let say that we want to build a form that will handle the following object:

```ts
export interface Spaceship {
  name: string;
  builtInYear: number;
  config: {
    maxSpeed: number;
    nbCanons: number;
  };
}
```

We could:

- Create a `SpaceshipForm` component
- This component would handle only the primitive values (here `name` and `builtInYear`) and it'd request the config from another component
- Create a sub component `SpaceshipConfigForm` which would itself handle only the primitive values (all of them in that case)

But let's take a look at the first level component (`SpaceshipForm`) to see why it'd be a small burden to do that on every sub component:

```ts
@Component({
  selector: 'my-custom-input',
  // ...
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MyCustomInput),
      multi: true,
    },
  ],
})
export class MyCustomInput implements ControlValueAccessor, OnInit, OnDestroy {
  private onChange: (value: any) => void;
  private onTouched: () => void;
  private onDestroy$: Subject<void> = new Subject();

  public internalFormGroup: FormGroup = new FormGroup({
    name: new FormControl(),
    builtInYear: new FormControl(),
    config: new FormControl(),
  });

  public ngOnInit(): void {
    this.internalFormGroup.valueChanges
      .pipe(
        tap(value => {
          this.onChange(value);
          this.onTouched();
        }),
        takeUntil(this.onDestroy$),
      )
      .subscribe();
  }

  public ngOnDestroy(): void {
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }

  writeValue(obj: any): void {
    // every time the form control is
    // being updated from the parent

    this.internalFormGroup.setValue(obj, { emitEvent: false });

    this.internalFormGroup.markAsPristine();
    this.internalFormGroup.markAsUntouched();
  }
  registerOnChange(fn: any): void {
    // when we want to let the parent
    // know that the value of the
    // form control should be updated

    this.onChange = fn;
  }
  registerOnTouched(fn: any): void {
    // when we want to let the parent
    // know that the form control
    // has been touched

    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    // when the parent updates the
    // state of the form control

    if (isDisabled) {
      this.internalFormGroup.disable();
    } else {
      this.internalFormGroup.enable();
    }
  }
}
```

The logic itself is not really complicated, but one thing sure is: **It is verbose**. That's only a minimal example and you could want to push things even further than that. But it's already ~75 lines. It seems to me that it is too much to just handle 2 inputs from that component :man_shrugging:.

Hopefully, you're about to find out why this blog post has been written (about time huh?) and how you can handle the above code in a better way.

# Ngx-Sub-Form: Utility library to break down an Angular form into multiple sub components

As briefly explained in the context part of that article, we've been working at [CloudNC](https://cloudnc.com) on a library that will handle all the boilerplate for you and give you some nice helpers. It's called [`ngx-sub-form`](https://github.com/cloudnc/ngx-sub-form).

The library is published on both [Github](https://github.com/cloudnc/ngx-sub-form) and [NPM](https://www.npmjs.com/package/ngx-sub-form) with an MIT license and is ready to be used. We've made a complete example/demo on the Github repository which is well tested too (both E2E and integration). We've also been rewriting a lot of our own forms with it and we believe that it is stable enough to be used by others now, so feel free to give it a try on your own projects!

## What `ngx-sub-form` has to offer

- Easily create sub forms or custom `ControlValueAccessor` with a minimal boilerplate
- Type safety on both `.ts` and `.html` files for your components
- Access all the values of the form, even the nested ones
- Access all the errors of the form, even the nested ones (which is not natively supported on `FormGroup`s, see https://github.com/angular/angular/issues/10530)
- You should be able to mostly deal with synchronous values without having to deal with streams
- Remap your original data to the shape you want for every form/sub form (and still keep it type safe)
- Handle polymorphic data within your forms in an easy way

## When should you use it?

Do you have a form?

> Yes

Then use it.

> My form is small and pretty simple, and I'm not sure it'll be worth it

You'll get type safety, less boilerplate and some helpers for free.  
Unless you really have only one `FormControl` to handle one search input, you should just use it.

![](https://thepracticaldev.s3.amazonaws.com/i/dknl4ccqo9ikw2v60vie.png)

> Enough words, show me some code!

## Building the demo

We'll now refactor the previous component except that this time, we'll build the whole form (including the config!).

Here's the interface as a reminder:  
_Which I've broken down into 2 now, as we normally would/should!_

```ts
export interface SpaceshipConfig {
  maxSpeed: number;
  nbCanons: number;
}

export interface Spaceship {
  name: string;
  builtInYear: number;
  config: SpaceshipConfig;
}
```

Looking at the interface, we can easily guess what architecture we want here:

- **spaceship-container**: Smart component that will inject a service to either retrieve a spaceship or save it when the form is valid and being sent
- **spaceship-form**: Dumb component that is the top form, which will be in charge of handling the first values of the `Spaceship`
- **spaceship-config-form**: Dumb component that is a sub form, only in charge of the config part

![](https://thepracticaldev.s3.amazonaws.com/i/f8x6ojs1xaaui965q8h4.png)

We'll start from the bottom component and then go up from there.
Here's the live demo of what I'm about to introduce: https://stackblitz.com/edit/ngx-sub-form-basics

You can play with and follow along on Stackblitz when you want to see the code in context.

{% stackblitz ngx-sub-form-basics view=preview %}

**spaceship-config-form.component.ts**:

```ts
@Component({
  selector: 'app-spaceship-config-form',
  templateUrl: './spaceship-config-form.component.html',
  providers: subformComponentProviders(SpaceshipConfigFormComponent),
})
export class SpaceshipConfigFormComponent extends NgxSubFormComponent<SpaceshipConfig> {
  protected getFormControls(): Controls<SpaceshipConfig> {
    return {
      maxSpeed: new FormControl(),
      nbCanons: new FormControl(),
    };
  }
}
```

As you can see, this is a sub form component and the boilerplate is minimal.

First, let's look at the line

```ts
providers: subformComponentProviders(SpaceshipConfigFormComponent),
```

When building a `ControlValueAccessor`, you need to at least provide `NG_VALUE_ACCESSOR` and also pass `NG_VALIDATORS` if you want to be able to deal with validation. It'd normally look like the following:

```ts
{
  // ...
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => component),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => component),
      multi: true,
    },
  ];
}
```

All of that is reduced to one line with the utility function `subformComponentProviders` where you simply need to provide the current class. It also works with the AoT compiler.

Then, notice the line:

```ts
export class SpaceshipConfigFormComponent extends NgxSubFormComponent<SpaceshipConfig>
```

By just doing that, you get access to a lot of

**properties**:

- `formGroup`: The actual form group, useful to define the binding `[formGroup]="formGroup"` to the view
- `formControlNames`: All the control names available in your form. Use it when defining a `formControlName` like so: `<input [formControlName]="formControlNames.yourControl">` and it'll catch errors at build time (with AOT) if you change an interface!
- `formGroupControls`: All the controls of your form, helpful to avoid doing `formGroup.get(formControlNames.yourControl)`; instead just do `formGroupControls.yourControl`
- `formGroupValues`: Access all the values of your form directly without doing `formGroup.get(formControlNames.yourControl).value`, instead just do `formGroupValues.yourControl` (and it'll be correctly typed!)
- `formGroupErrors`: All the errors of the current form **including** the sub errors (if any). Just use `formGroupErrors` or `formGroupErrors?.yourControl`. Notice the question mark in `formGroupErrors?.yourControl`, it **will return `null` if there's no error**

**methods**:

- `onFormUpdate` hook: Allows you to react whenever the form is being modified. Instead of subscribing to `this.formGroup.valueChanges` or `this.formControls.someProp.valueChanges` you will not have to deal with anything asynchronous nor have to worry about subscriptions and memory leaks. Just implement the method `onFormUpdate(formUpdate: FormUpdate<FormInterface>): void` and if you need to know which property changed do a check like the following: `if (formUpdate.yourProperty) {}`. Be aware that this method will be called only when there are either local changes to the form or changes coming from subforms. If the parent either calls `setValue` or `patchValue`, this method won't be called
- `getFormGroupControlOptions` hook: Allows you to define control options for construction of the internal `FormGroup`. Use this to define `FormGroup`-level validators
- `handleEmissionRate` hook: Allows you to define a custom emission rate (top level or any sub level)

Now you must think that it starts to be a lot and that hopefully we won't add to much after that. In that case, you'll be happy to know that this covers most of `ngx-sub-form` and the rest will now feel like deja-vu.

**spaceship-config-form.component.html**:

```html
<fieldset [formGroup]="formGroup">
  <legend>Config</legend>

  Maximum speed
  <input type="number" [formControlName]="formControlNames.maxSpeed" />

  Number of canons
  <input type="number" [formControlName]="formControlNames.nbCanons" />
</fieldset>
```

No further explanation needed for the `html` I think.

Now, let's move on to the top level form.

**spaceship-form.component.ts**:

```ts
@Component({
  selector: 'app-spaceship-form',
  templateUrl: './spaceship-form.component.html',
})
export class SpaceshipFormComponent extends NgxRootFormComponent<Spaceship> {
  @DataInput()
  @Input('spaceship')
  public dataInput: Spaceship | null | undefined;

  @Output('spaceshipUpdated')
  public dataOutput: EventEmitter<Spaceship> = new EventEmitter();

  protected getFormControls(): Controls<Spaceship> {
    return {
      name: new FormControl(),
      builtInYear: new FormControl(),
      config: new FormControl(),
    };
  }
}
```

The purpose of that component is not to be bound to a `FormControl` like previous ones but instead:

- To be able to update the form from an `Input` (`dataInput`, that you can of course rename)
- To be able to share (emit) the new value once the form is valid and saved (through the `Output` `dataOutput`, that you can also rename)

Note: When using `NgxRootFormComponent`, `dataInput` does **require** you to use the `@DataInput()` decorator with it. The reason behind that is simple: `ngx-sub-form` has no way to know how you're going to rename your input and it does need to have a hook to be warned when that value changes. Instead of asking you to call a method from the `ngOnChanges` hook or to create a setter on the input and call that same method, we take care of all of that with the [decorator](https://github.com/cloudnc/ngx-sub-form/blob/master/projects/ngx-sub-form/src/lib/ngx-sub-form.decorators.ts).

Let's take a quick look at the view.

**spaceship-form.component.html**:

```html
<form [formGroup]="formGroup">
  <fieldset>
    <legend>Spaceship</legend>
    Name
    <input type="text" [formControlName]="formControlNames.name" />

    Built in year
    <input type="number" [formControlName]="formControlNames.builtInYear" />

    <app-spaceship-config-form [formControlName]="formControlNames.config"></app-spaceship-config-form>

    <button (click)="manualSave()">Save</button>
  </fieldset>
</form>

<pre>{{ formGroup.value | json }}</pre>
```

Nothing particularly new but note that we can display the whole form value (for debugging purpose here) by using `formGroup.value` and also that to save the form we simply call the `manualSave` method offered by `ngx-sub-form` when using `NgxRootFormComponent`.

Once we call `manualSave`, if the form is valid it'll emit the form's value through the output. This way the parent can simply retrieve a new `Spaceship` object and deal with it (put it into local storage, pass it to a service to make an HTTP call with it, etc). But **the form is responsible only for the form itself**, and the smart component (parent) is not even aware of the form. It is simply aware that a new value is available.

Speaking of which, let's take a look to the parent component.

**spaceship-container.component.ts**

```ts
// only to demo that passing a value as input will update the form
// but this info might come from a server for example when you want to
// edit an existing value
const getDefaultSpaceship = (): Spaceship => ({
  name: 'Galactico',
  builtInYear: 2500,
  config: {
    maxSpeed: 8000,
    nbCanons: 10,
  },
});

@Component({
  selector: 'app-spaceship-container',
  templateUrl: './spaceship-container.component.html',
})
export class SpaceshipContainerComponent {
  public spaceship$: Subject<Spaceship> = new Subject();

  public preFillForm(): void {
    this.spaceship$.next(getDefaultSpaceship());
  }

  public spaceshipUpdated(spaceship: Spaceship): void {
    // from here, you can pass that value to a
    // service to save/update it on a backend for example
    console.log(spaceship);
  }
}
```

Interesting thing here - that smart component that would retrieve the data to populate the form and collect the new values of the form when it's being saved is **only** dealing with object of type `Spaceship`. Not a single `FormGroup` instance or `FormControl` is declared/used. We just delegate that responsibility to `SpaceshipFormComponent`. This is really convenient because if later in the app we want to display a `Spaceship` we could just reuse the form and disable it, so it'd be readonly. How so? `NgxRootFormComponent` and `NgxAutomaticRootFormComponent` both have an optional input property `disabled`. Simply bind a boolean to it and when the value is `true`, the form will be readonly. To be more specific, the whole form will be readonly, that includes all the sub form components too :thumbsup:.

The view here is pretty simple, but for the sake of completeness:

**spaceship-container.component.html**

```html
<button (click)="preFillForm()">Pre fill form (demo)</button>

<app-spaceship-form [spaceship]="spaceship$ | async" (spaceshipUpdated)="spaceshipUpdated($event)"></app-spaceship-form>
```

## Going further with remapping and/or polymorphism

So far, we've seen how to break down a form into smaller components.
The last remaining bit is now to discover how to handle forms with polymorphic data.

Let's start with a small reminder about `polymorphism` ([Wikipedia](<https://en.wikipedia.org/wiki/Polymorphism_(computer_science)>)):

> In programming languages and type theory, polymorphism is the provision of a single interface to entities of different types or the use of a single symbol to represent multiple different types.

Example using the interfaces from the beginning of the post:

```ts
export type OneListing = VehicleListing | DroidListing;
```

One object of type `OneListing` can either be a `VehicleListing` or a `DroidListing`.

Even if it might not be the kind of structure you'll be using all the time with your forms, it is a fairly common use case and `ngx-sub-form` offers a dedicated class to deal with that: `NgxSubFormRemapComponent<ControlInterface, FormInterface>`.

_Note that `NgxRootFormComponent` and `NgxAutomaticRootFormComponent` are both using `NgxSubFormRemapComponent` as a base class so you can use the provided methods to remap within those too._

From here, the idea will be to create a new interface for that part of the form, which will have:

- One entry to know what is the currently selected type
- A different entry for every possible type

Example in our case:

```ts
export type OneListing = VehicleListing | DroidListing;

export enum OneListingType {
  VEHICLE = 'Vehicle',
  DROID = 'Droid',
}

export interface OneListingForm {
  listingType: OneListingType | null;
  vehicle: VehicleListing | null;
  droid: DroidListing | null;
}
```

Then we can create our component like the following:

```ts
@Component({
  selector: 'app-one-listing-form',
  templateUrl: '...',
})
export class OneListingForm extends NgxRootFormComponent<OneListing, OneListingForm> {
  // note that we use `NgxRootFormComponent` as it extends `NgxSubFormRemapComponent`
  // and this is the top level form; that's why we will be using `NgxRootFormComponent`
  // ...
}
```

At that point, Typescript will show an error and tell you that you need to correctly implement the class.

```ts
@Component({
  selector: 'app-one-listing-form',
  templateUrl: '...',
})
export class OneListingForm extends NgxSubFormRemapComponent<OneListing, OneListingForm> {
  @DataInput()
  @Input('listing')
  public dataInput: OneListing | null | undefined;

  @Output('listingUpdated')
  public dataOutput: EventEmitter<OneListing> = new EventEmitter();

  public OneListingType: typeof OneListingType = OneListingType;

  protected getFormControls(): Controls<OneListingForm> {
    return {
      listingType: new FormControl(null, { validators: [Validators.required] }),
      vehicle: new FormControl(null),
      droid: new FormControl(null),
    };
  }

  protected transformToFormGroup(obj: OneListing): OneListingForm {
    return {
      listingType: obj.listingType,
      vehicle: obj.listingType === OneListingType.VEHICLE ? obj : null,
      droid: obj.listingType === OneListingType.DROID ? obj : null,
    };
  }

  protected transformFromFormGroup(formValue: OneListingForm): OneListing | null {
    switch (formValue.listingType) {
      case OneListingType.VEHICLE:
        return formValue.vehicle;
      case OneListingType.DROID:
        return formValue.droid;
      case null:
        return null;
      default:
        throw new UnreachableCase(formValue.listingType);
    }
  }
}
```

As you probably noticed, we're using 2 new methods to deal with polymorphic data:

- `transformToFormGroup`: Passes as argument the value that is being written on that sub component (or via the `dataInput` if using a top level component) and remap that value to an internal one that splits the polymorphic object into separated entities
- `transformFromFormGroup`: Passes the value of the form and expect as output to have an object matching the original interface

Within the `transformToFormGroup` method, it will be really straightforward if your different objects have a **discriminator** property. In our case, they do:

```ts
export interface VehicleListing extends BaseListing {
  listingType: ListingType.VEHICLE; // discriminator
  product: OneVehicle;
}

export interface DroidListing extends BaseListing {
  listingType: ListingType.DROID; // discriminator
  product: OneDroid;
}

export type OneListing = VehicleListing | DroidListing;
```

The `listingType` property is common to `VehicleListing` and `DroidListing` but is set to a well defined value in both cases. This allows us to do a really simple check as follow:

```ts
protected transformToFormGroup(obj: OneListing): OneListingForm {
  return {
    listingType: obj.listingType,
    vehicle: obj.listingType === OneListingType.VEHICLE ? obj : null,
    droid: obj.listingType === OneListingType.DROID ? obj : null,
  };
}
```

If you don't have a discriminator on your properties, you will need to somehow differentiate them based on other properties but I'd strongly advise you to add a discriminator if you have control of the interface as it will make things easier, not only for your forms.

The `transformFromFormGroup` method is also straightforward - based on the form value `listingType` we will just return the appropriate value from the form:

```ts
protected transformFromFormGroup(formValue: OneListingForm): OneListing | null {
  switch (formValue.listingType) {
    case OneListingType.VEHICLE:
      return formValue.vehicle;
    case OneListingType.DROID:
      return formValue.droid;
    case null:
      return null;
    default:
      throw new UnreachableCase(formValue.listingType);
  }
}
```

The line throwing an error should never happen and is here mainly for type safety reasons as it'll force you to implement all the cases:

```ts
throw new UnreachableCase(formValue.listingType);
```

If you don't have something similar in your own project, you could put the following in a shared folder

```ts
export class UnreachableCase {
  constructor(payload: never) {}
}
```

If in future we add or remove one of the values to the `OneListingType` enum, Typescript will throw an error and make sure we don't forget any of the use cases.

# Summary and take away

This article is now coming to an end and I hope you enjoyed this (new?) way of working with forms. However as we went pretty deep into details and it's almost a 20 minute read, I'd like to make a small summary of the important bits that you should remember:

- Break down your forms, it'll make things easier to reason about and deal with
- Prefer a `ControlValueAccessor` rather than passing your `FormGroup` or `FormControl` as inputs to a sub component
- Put on your gloves, armor and helmet, stare at your terminal for a few seconds and run `yarn install ngx-sub-form` to avoid the boilerplate of creating a custom `ControlValueAccessor` (plus enjoy some nice helpers and type safety!)
- If you're building a top level form component, make your choice between `NgxRootFormComponent` and `NgxAutomaticRootFormComponent` (manual save or instant save as soon as there's a change)
- If you're building a sub form component, choose between `NgxSubFormComponent` and `NgxSubFormRemapComponent` depending whether you need to remap your data or not
- Enjoy

Thanks for reading, this is my first blog post ever so please let me know how you found it so I can improve for the next ones! We might disagree on some point, or I might not have explained well enough. Either way I want to know, so please don't be shy and share what you didn't like, what I could have skipped, if it was too long, not detailed enough, etc.

If you have other ideas to improve `ngx-sub-form`, feel free to visit the Github project and either write an issue or make a pull request :fire:.

# Useful links

- Github repository: https://github.com/cloudnc/ngx-sub-form
- Live demo of a form with polymorphic data that has been broken down into different sub components: https://cloudnc.github.io/ngx-sub-form
- Source code of the live demo: https://github.com/cloudnc/ngx-sub-form/tree/master/src/app
- Stackblitz of the demo that we've been building in this article: https://stackblitz.com/edit/ngx-sub-form-basics

<hr>

- Follow me on Twitter: https://twitter.com/maxime1992 (I share things about Angular :rainbow:)
- Follow me on Github: https://github.com/maxime1992 (I try to open source as much things as I can, most of the time around Typescript, Node, Angular, NestJs)

<hr>

- Zak's Twitter: https://twitter.com/zak
- Zak's Github page: https://github.com/zakhenry

<hr>

- CloudNC website: https://cloudnc.com (lot of [jobs](https://cloudnc.com/careers) in London if you're interested!)
- CloudNC's Github page: https://github.com/cloudnc (we've got few other libraries for favicons and web workers)

Thanks again for reading!

# Found a typo?

If you've found a typo, a sentence that could be improved or anything else that should be updated on this blog post, you can access it through a git repository and make a pull request. Instead of posting a comment, please go directly to https://github.com/maxime1992/my-dev.to and open a new pull request with your changes. If you're interested how I manage my dev.to posts through git and CI, [read more here](https://dev.to/maxime1992/manage-your-dev-to-blog-posts-from-a-git-repo-and-use-continuous-deployment-to-auto-publish-update-them-143j).

# Follow me

| Dev.to                                                                                                                              | Github                                                                                                                                           | Twitter                                                                                                                                              | Reddit                                                                                                                                                    | Linkedin                                                                                                                                                              |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [![Dev](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/dev-logo.png 'Dev')](https://dev.to/maxime1992) | [![Github](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/github-logo.png 'Github')](https://github.com/maxime1992) | [![Twitter](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/twitter-logo.png 'Twitter')](https://twitter.com/maxime1992) | [![Reddit](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/reddit-logo.png 'Reddit')](https://www.reddit.com/user/maxime1992) | [![Linkedin](https://raw.githubusercontent.com/maxime1992/my-dev.to/master/shared-assets/linkedin-logo.png 'Linkedin')](https://www.linkedin.com/in/maximerobert1992) |
